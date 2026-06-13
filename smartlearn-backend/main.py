import logging
import io
import json
import gc
import os
import uuid
import time
from datetime import datetime, timezone
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends, Response
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import text, func
from sqlalchemy.orm import Session
import asyncio

from services.llm import stream_llm_response, search_tavily, get_optimal_search_query, generate_chat_title
from services.pdf import extract_text, get_pdf_metadata
from services.rag import store_pdf, search, clear_session, get_stats
from services.voice import transcribe_audio, generate_speech
from services.youtube import get_youtube_recommendations
from services.redis_client import get_cache, set_cache, delete_cache, check_rate_limit, clear_all_cache
from database import SessionLocal, Chat, get_db, get_async_db, User, ChatMetadata
from routers import auth
from services.jwt_handler import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

security = HTTPBearer()

class CachedUser:
    def __init__(self, id, name, email, avatar, nickname="", occupation="", style_tone="", custom_instructions=""):
        self.id = id
        self.name = name
        self.email = email
        self.avatar = avatar
        self.nickname = nickname
        self.occupation = occupation
        self.style_tone = style_tone
        self.custom_instructions = custom_instructions

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials, token_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    
    from services.redis_client import get_cache, set_cache
    cache_key = f"user_profile:{user_id}"
    cached_user = get_cache(cache_key)
    if cached_user:
        return CachedUser(**cached_user)
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    set_cache(cache_key, {
        "id": user.id, "name": user.name, "email": user.email, "avatar": user.avatar,
        "nickname": user.nickname or "",
        "occupation": user.occupation or "",
        "style_tone": user.style_tone or "",
        "custom_instructions": user.custom_instructions or ""
    }, expire_seconds=3600)
    return user

def get_full_chat_id(user_id: int, chat_id: str) -> str:
    prefix = f"{user_id}_"
    return str(chat_id) if str(chat_id).startswith(prefix) else f"{prefix}{chat_id}"

# ────────────────────────────────────────────────────
# LOGGING — so Railway shows real errors
# ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────
# APP — Modern Lifespan
# ────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== SmartLearn AI starting up ===")
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        try:
            db.execute(text("ALTER TABLE chat_metadata ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE"))
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT DEFAULT ''"))
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation TEXT DEFAULT ''"))
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS style_tone TEXT DEFAULT ''"))
            db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_instructions TEXT DEFAULT ''"))
        except Exception:
            pass
        db.commit()
        db.close()
        logger.info("✅ Database connected OK")
    except Exception as e:
        logger.error(f"❌ DATABASE FAILED: {e}")
    try:
        from services.rag import get_model
        get_model()
        logger.info("✅ Sentence transformer model loaded OK")
    except Exception as e:
        logger.error(f"❌ MODEL LOAD FAILED: {e}")
    logger.info("=== Startup complete ===")
    yield
    logger.info("=== SmartLearn AI shutting down ===")

app = FastAPI(title="SmartLearn AI", version="14.0.0", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://smart-learn-ai-gules.vercel.app,http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


# ────────────────────────────────────────────────────
# SCHEMA
# ────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str = Field(..., max_length=10000)
    chat_id: Optional[str] = None
    search_web: Optional[str] = "auto"
    model: Optional[str] = "groq:llama-3.1-8b-instant"
    image_data: Optional[str] = None

class RenameRequest(BaseModel):
    title: str

class PinRequest(BaseModel):
    is_pinned: bool


# ────────────────────────────────────────────────────
# HEALTH
# ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "SmartLearn AI Running 🚀", "version": "14.0.0"}

@app.get("/health")
def health():
    return {"ok": True}


# ────────────────────────────────────────────────────
# BACKGROUND DB SAVE
# ────────────────────────────────────────────────────
def save_to_db(user_id: int, chat_id: str, message: str, response: str):
    db = SessionLocal()
    try:
        count = db.query(func.count(Chat.id)).filter(Chat.chat_id == chat_id).scalar()
        db.add(Chat(user_id=user_id, chat_id=chat_id, message=message, response=response))
        db.commit()
        logger.info(f"💾 Saved message for chat_id={chat_id}")
        if count == 0:
            title = generate_chat_title(message)
            meta = db.query(ChatMetadata).filter(ChatMetadata.chat_id == chat_id, ChatMetadata.user_id == user_id).first()
            if not meta:
                new_meta = ChatMetadata(user_id=user_id, chat_id=chat_id, title=title)
                db.add(new_meta)
            else:
                meta.title = title
            db.commit()
            logger.info(f"✨ Auto-generated title for {chat_id}: {title}")
        
        # 🚀 Invalidate caches since there is a new message
        delete_cache(f"chat_messages:{chat_id}")
        delete_cache(f"user_chats:{user_id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ DB save error: {e}")
    finally:
        db.close()


# ────────────────────────────────────────────────────
# CHAT — SSE streaming
# ────────────────────────────────────────────────────
@app.post("/chat")
def chat(data: ChatRequest, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # ── 0. Rate Limiting ──
    # Max 15 messages per 60 seconds per user
    if not check_rate_limit(f"ratelimit:chat:{current_user.id}", max_requests=15, window_seconds=60):
        raise HTTPException(status_code=429, detail="You are sending messages too fast. Please wait a moment.")

    message = data.message.strip()
    chat_id = get_full_chat_id(current_user.id, data.chat_id)

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    logger.info(f"💬 Chat request: chat_id={chat_id} msg_len={len(message)}")

    # ── 1. Fetch conversation history for multi-turn memory ──
    conversation_history = []
    try:
        recent = db.query(Chat).filter(
            Chat.chat_id == chat_id, Chat.user_id == current_user.id
        ).order_by(Chat.id.desc()).limit(10).all()
        recent.reverse()  # Restore chronological order
        for c in recent:
            msg = c.message[:2000] if len(c.message) > 2000 else c.message
            conversation_history.append({"role": "user", "content": msg})
            resp = c.response[:2000] if len(c.response) > 2000 else c.response
            conversation_history.append({"role": "assistant", "content": resp})
        if conversation_history:
            logger.info(f"📚 Loaded {len(recent)} past turns for conversation memory")
    except Exception as e:
        logger.error(f"❌ History fetch error: {e}")

    # ── 2. RAG context ──
    try:
        context = search(message, chat_id=chat_id)
        if context and len(context) > 10000:
            context = context[:10000] + "\n...[truncated]"
    except Exception as e:
        logger.error(f"❌ RAG search error: {e}")
        context = ""

    def token_generator():
        nonlocal context
        full_response = []
        try:
            # 3. Evaluate web search
            search_query = "NO_SEARCH"
            if data.search_web == "on":
                yield f"data: {json.dumps({'status': 'evaluating'})}\n\n"
                logger.info(f"🤖 Generating optimal search query for: {message}")
                search_query = get_optimal_search_query(message, conversation_history, force=True)
            elif data.search_web == "auto":
                yield f"data: {json.dumps({'status': 'evaluating'})}\n\n"
                logger.info(f"🤖 Auto-evaluating web search for: {message}")
                search_query = get_optimal_search_query(message, conversation_history, force=False)

            # 4. Perform Web Search
            if search_query != "NO_SEARCH":
                yield f"data: {json.dumps({'status': 'searching_web'})}\n\n"
                logger.info(f"🌐 Web Search via Tavily for Query: {search_query}")
                web_context, urls = search_tavily(search_query)
                if web_context:
                    context = (context + "\n\n### 🌐 Web Search Results:\n" + web_context) if context else ("### 🌐 Web Search Results:\n" + web_context)
                    yield f"data: {json.dumps({'status': 'search_complete', 'urls': urls})}\n\n"
                else:
                    yield f"data: {json.dumps({'status': 'search_complete'})}\n\n"
            else:
                yield f"data: {json.dumps({'status': 'search_complete'})}\n\n"

            # 5. Build prompt
            current_time = datetime.now().strftime("%Y-%m-%d %I:%M %p")
            if context:
                user_prompt = f"Document & Web Context:\n{context}\n\nCurrent Date and Time: {current_time}\n\nStudent question: {message}\n\nYou are SmartLearn AI, an advanced, professional tutor. Please answer the student's question comprehensively using the provided Context.\nYour response MUST be detailed, highly structured, and utilize rich Markdown formatting such as:\n- **Headings (##, ###)** to organize different sections\n- **Tables** to compare data or present statistics if applicable\n- **Bullet points** and **bold text** for key information\n\nCRITICAL INSTRUCTION: You must heavily synthesize and rely on the provided Context. If you pull facts from the Web Search Results, you MUST cite the source URL provided in the context (e.g. `[Source](URL)`). If the answer is absolutely not found in the context, you may use your internal knowledge, but explicitly state that you are doing so."
            else:
                user_prompt = f"Current Date and Time: {current_time}\n\nQuestion: {message}\n\nYou are SmartLearn AI, an advanced, professional tutor. Please answer the student's question comprehensively. Your response MUST be detailed, highly structured, and utilize rich Markdown formatting."

            # 6. Stream LLM with conversation history
            for token in stream_llm_response(
                user_prompt, 
                model_id=data.model, 
                history=conversation_history, 
                image_data=data.image_data,
                nickname=current_user.nickname,
                occupation=current_user.occupation,
                style_tone=current_user.style_tone,
                custom_instructions=current_user.custom_instructions
            ):
                full_response.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"

        except Exception as e:
            err = f"\n\n⚠️ Stream error: {str(e)}"
            logger.error(f"❌ Stream error: {e}")
            full_response.append(err)
            yield f"data: {json.dumps({'token': err})}\n\n"

        finally:
            complete = "".join(full_response)
            if complete.strip():
                if 'urls' in locals() and urls:
                    import json as _json
                    hidden_data = _json.dumps(urls)
                    complete += f"\n\n<!-- SOURCES_JSON: {hidden_data} -->"
                background_tasks.add_task(save_to_db, current_user.id, chat_id, message, complete)
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        token_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


# ────────────────────────────────────────────────────
# GET CHATS
# ────────────────────────────────────────────────────
@app.get("/chats")
async def get_chats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_async_db)):
    cache_key = f"user_chats:{current_user.id}"
    cached_data = get_cache(cache_key)
    if cached_data:
        return cached_data

    try:
        # 1. Fetch metadata
        result = await db.execute(select(ChatMetadata).filter(ChatMetadata.user_id == current_user.id))
        metadata = result.scalars().all()
        metadata_map = {
            m.chat_id: {
                "title": m.title, 
                "is_pinned": m.is_pinned,
                "is_archived": m.is_archived,
                "is_shared": m.is_shared,
                "share_id": m.share_id
            } for m in metadata
        }
        
        # 2. Fetch ONLY the first message of each chat (for fallback titles) to save massive amounts of RAM
        subquery = select(Chat.chat_id, func.min(Chat.id).label("min_id")).filter(Chat.user_id == current_user.id).group_by(Chat.chat_id).subquery()
        result = await db.execute(select(Chat).join(subquery, Chat.id == subquery.c.min_id))
        first_messages = result.scalars().all()
        
        grouped: dict = {}
        for c in first_messages:
            grouped[c.chat_id] = [{"role": "user", "content": c.message[:100]}]
            
        data = {"chats": grouped, "metadata": metadata_map}
        set_cache(cache_key, data)
        return data
    except Exception as e:
        logger.error(f"❌ get_chats error: {e}")
        return {"chats": {}, "metadata": {}}


# ────────────────────────────────────────────────────
# GET CHAT MESSAGES
# ────────────────────────────────────────────────────
@app.get("/chat/{chat_id}/messages")
async def get_chat_messages(chat_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_async_db)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    cache_key = f"chat_messages:{full_chat_id}"
    cached_data = get_cache(cache_key)
    if cached_data:
        return cached_data

    try:
        result = await db.execute(select(Chat).filter(Chat.chat_id == full_chat_id, Chat.user_id == current_user.id).order_by(Chat.id.asc()))
        chats = result.scalars().all()
        messages = []
        for c in chats:
            messages.append({"role": "user", "content": c.message})
            messages.append({"role": "assistant", "content": c.response})
            
        data = {"messages": messages}
        set_cache(cache_key, data)
        return data
    except Exception as e:
        logger.error(f"❌ get_chat_messages error: {e}")
        return {"messages": []}


# ────────────────────────────────────────────────────
# RENAME CHAT
# ────────────────────────────────────────────────────
@app.put("/chat/{chat_id}/rename")
def rename_chat(chat_id: str, data: RenameRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    
    metadata = db.query(ChatMetadata).filter(ChatMetadata.chat_id == full_chat_id, ChatMetadata.user_id == current_user.id).first()
    if metadata:
        metadata.title = data.title
    else:
        new_metadata = ChatMetadata(user_id=current_user.id, chat_id=full_chat_id, title=data.title)
        db.add(new_metadata)
    
    db.commit()
    delete_cache(f"user_chats:{current_user.id}")
    return {"status": "success", "title": data.title}


# ────────────────────────────────────────────────────
# PIN CHAT
# ────────────────────────────────────────────────────
@app.put("/chat/{chat_id}/pin")
def pin_chat(chat_id: str, data: PinRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    
    metadata = db.query(ChatMetadata).filter(ChatMetadata.chat_id == full_chat_id, ChatMetadata.user_id == current_user.id).first()
    if metadata:
        metadata.is_pinned = data.is_pinned
    else:
        first_chat = db.query(Chat).filter(Chat.chat_id == full_chat_id).order_by(Chat.id.asc()).first()
        title = first_chat.message[:30] if first_chat else "New Chat"
        new_metadata = ChatMetadata(user_id=current_user.id, chat_id=full_chat_id, title=title, is_pinned=data.is_pinned)
        db.add(new_metadata)
    
    db.commit()
    delete_cache(f"user_chats:{current_user.id}")
    return {"status": "success", "is_pinned": data.is_pinned}


# ────────────────────────────────────────────────────
# ARCHIVE CHAT
# ────────────────────────────────────────────────────
@app.put("/chat/{chat_id}/archive")
def archive_chat(chat_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    metadata = db.query(ChatMetadata).filter(ChatMetadata.chat_id == full_chat_id, ChatMetadata.user_id == current_user.id).first()
    if metadata:
        metadata.is_archived = True
    else:
        first_chat = db.query(Chat).filter(Chat.chat_id == full_chat_id).order_by(Chat.id.asc()).first()
        title = first_chat.message[:30] if first_chat else "New Chat"
        new_metadata = ChatMetadata(user_id=current_user.id, chat_id=full_chat_id, title=title, is_archived=True)
        db.add(new_metadata)
    db.commit()
    delete_cache(f"user_chats:{current_user.id}")
    return {"status": "archived"}

@app.put("/chats/archive_all")
def archive_all_chats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Archive all unarchived chats
    db.query(ChatMetadata).filter(
        ChatMetadata.user_id == current_user.id,
        ChatMetadata.is_archived == False
    ).update({"is_archived": True})
    
    # Also find all chats that don't even have metadata yet and create metadata for them
    subquery = db.query(Chat.chat_id, func.min(Chat.id).label("min_id")).filter(Chat.user_id == current_user.id).group_by(Chat.chat_id).subquery()
    first_messages = db.query(Chat).join(subquery, Chat.id == subquery.c.min_id).all()
    
    existing_meta = {m.chat_id for m in db.query(ChatMetadata.chat_id).filter(ChatMetadata.user_id == current_user.id).all()}
    
    for c in first_messages:
        if c.chat_id not in existing_meta:
            title = c.message[:30]
            new_metadata = ChatMetadata(user_id=current_user.id, chat_id=c.chat_id, title=title, is_archived=True)
            db.add(new_metadata)
            
    db.commit()
    delete_cache(f"user_chats:{current_user.id}")
    return {"status": "success"}

@app.put("/chat/{chat_id}/unarchive")
def unarchive_chat(chat_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    metadata = db.query(ChatMetadata).filter(ChatMetadata.chat_id == full_chat_id, ChatMetadata.user_id == current_user.id).first()
    if metadata:
        metadata.is_archived = False
        db.commit()
        delete_cache(f"user_chats:{current_user.id}")
    return {"status": "unarchived"}


# ────────────────────────────────────────────────────
# SHARE CHAT
# ────────────────────────────────────────────────────
# ────────────────────────────────────────────────────

@app.post("/chat/{chat_id}/share")
def share_chat(chat_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    metadata = db.query(ChatMetadata).filter(ChatMetadata.chat_id == full_chat_id, ChatMetadata.user_id == current_user.id).first()
    
    if not metadata:
        first_chat = db.query(Chat).filter(Chat.chat_id == full_chat_id).order_by(Chat.id.asc()).first()
        title = first_chat.message[:30] if first_chat else "New Chat"
        metadata = ChatMetadata(user_id=current_user.id, chat_id=full_chat_id, title=title)
        db.add(metadata)
        db.commit()
        db.refresh(metadata)
        
    if not metadata.is_shared or not metadata.share_id:
        metadata.is_shared = True
        metadata.share_id = uuid.uuid4().hex
        db.commit()
        
    return {"status": "shared", "share_id": metadata.share_id}

@app.delete("/chat/{chat_id}/share")
def revoke_share_chat(chat_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    metadata = db.query(ChatMetadata).filter(ChatMetadata.chat_id == full_chat_id, ChatMetadata.user_id == current_user.id).first()
    if metadata:
        metadata.is_shared = False
        metadata.share_id = None
        db.commit()
    return {"status": "revoked"}

@app.get("/shared/{share_id}")
def get_shared_chat(share_id: str, db: Session = Depends(get_db)):
    metadata = db.query(ChatMetadata).filter(ChatMetadata.share_id == share_id, ChatMetadata.is_shared == True).first()
    if not metadata:
        raise HTTPException(status_code=404, detail="Shared chat not found or access revoked")
        
    chats = db.query(Chat).filter(Chat.chat_id == metadata.chat_id).order_by(Chat.id.asc()).all()
    messages = []
    for c in chats:
        messages.append({"role": "user", "content": c.message})
        messages.append({"role": "assistant", "content": c.response})
        
    return {"title": metadata.title, "messages": messages, "created_at": chats[0].created_at if chats else None}


# ────────────────────────────────────────────────────
# DELETE CHAT
# ────────────────────────────────────────────────────
@app.delete("/chat/{chat_id}")
def delete_chat(chat_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    try:
        deleted = db.query(Chat).filter(Chat.chat_id == full_chat_id, Chat.user_id == current_user.id).delete()
        db.query(ChatMetadata).filter(ChatMetadata.chat_id == full_chat_id, ChatMetadata.user_id == current_user.id).delete()
        db.commit()
        clear_session(full_chat_id)
        gc.collect()
        delete_cache(f"chat_messages:{full_chat_id}")
        delete_cache(f"user_chats:{current_user.id}")
        logger.info(f"🗑️ Deleted chat_id={chat_id} rows={deleted}")
        return {"status": "deleted", "rows": deleted}
    except Exception as e:
        db.rollback()
        logger.error(f"❌ delete_chat error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# ────────────────────────────────────────────────────
# PDF UPLOAD
# ────────────────────────────────────────────────────
@app.post("/upload")
async def upload(file: UploadFile = File(...), chat_id: str = "default", current_user: User = Depends(get_current_user)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    logger.info(f"📄 Upload: filename={file.filename} chat_id={full_chat_id}")
    try:
        allowed_types = ("application/pdf", "text/plain")
        allowed_exts  = (".pdf", ".txt", ".doc", ".docx")
        fname = (file.filename or "").lower()

        if file.content_type not in allowed_types and not any(fname.endswith(e) for e in allowed_exts):
            raise HTTPException(status_code=400, detail="Only PDF and text files are supported")

        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="File is empty")

        logger.info(f"📄 File size: {len(file_bytes)} bytes")

        text = await run_in_threadpool(extract_text, io.BytesIO(file_bytes))
        if not text or not text.strip():
            raise HTTPException(status_code=422, detail="No readable text found in this file")
        if text.startswith("PDF extraction error:"):
            raise HTTPException(status_code=400, detail=text)

        logger.info(f"📄 Extracted {len(text)} chars — now storing in RAG...")

        chunk_count = await run_in_threadpool(store_pdf, text, chat_id=full_chat_id)
        logger.info(f"✅ Stored {chunk_count} chunks for chat_id={full_chat_id}")

        try:
            meta = await run_in_threadpool(get_pdf_metadata, io.BytesIO(file_bytes))
        except Exception:
            meta = {"pages": "?", "title": "", "author": ""}

        del file_bytes
        gc.collect()

        return {
            "status": "success",
            "filename": file.filename,
            "chunks": chunk_count,
            "pages": meta.get("pages", "?"),
            "characters": len(text),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Upload error: {e}")
        return JSONResponse(status_code=500, content={"error": f"Upload failed: {str(e)}"})

@app.post("/api/voice")
async def process_voice(audio: UploadFile = File(...)):
    try:
        contents = await audio.read()
        logger.info(f"Received audio file: {audio.filename}, size: {len(contents)} bytes")
        text = await transcribe_audio(contents, audio.filename)
        return {"text": text}
    except Exception as e:
        logger.error(f"Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-US-JennyNeural"

# generate_speech imported at top

@app.post("/api/tts")
async def text_to_speech(req: TTSRequest):
    try:
        audio_bytes = await generate_speech(req.text, req.voice)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS Route Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class YouTubeRequest(BaseModel):
    query: str

@app.post("/api/youtube")
async def get_youtube_videos(req: YouTubeRequest):
    try:
        videos = await get_youtube_recommendations(req.query)
        return {"videos": videos}
    except Exception as e:
        logger.error(f"YouTube Route Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ────────────────────────────────────────────────────
# RAG STATUS
# ────────────────────────────────────────────────────
@app.get("/rag-status")
def rag_status(chat_id: str = "default", current_user: User = Depends(get_current_user)):
    full_chat_id = get_full_chat_id(current_user.id, chat_id)
    return get_stats(chat_id=full_chat_id)


# ────────────────────────────────────────────────────