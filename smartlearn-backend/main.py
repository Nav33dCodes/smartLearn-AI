import logging
import io
import json
import gc

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy import text

from services.llm import stream_llm_response
from services.pdf import extract_text, get_pdf_metadata
from services.rag import store_pdf, search, clear_session, get_stats
from database import SessionLocal, Chat

# ────────────────────────────────────────────────────
# LOGGING — so Railway shows real errors
# ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────
# APP
# ────────────────────────────────────────────────────
app = FastAPI(title="SmartLearn AI", version="81.7.8")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smart-learn-ai-gules.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ────────────────────────────────────────────────────
# STARTUP — logs exact crash reason to Railway
# ────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("=== SmartLearn AI starting up ===")

    # 1. Test DB connection
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("✅ Database connected OK")
    except Exception as e:
        logger.error(f"❌ DATABASE FAILED: {e}")
        # Don't raise — let server start anyway, DB errors show per-request

    # 2. Pre-load sentence transformer model
    # This prevents timeout on first /chat or /upload request
    try:
        from services.rag import get_model
        get_model()
        logger.info("✅ Sentence transformer model loaded OK")
    except Exception as e:
        logger.error(f"❌ MODEL LOAD FAILED: {e}")

    logger.info("=== Startup complete ===")


# ────────────────────────────────────────────────────
# SCHEMA
# ────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    chat_id: str = "default"


# ────────────────────────────────────────────────────
# HEALTH
# ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "SmartLearn AI Running 🚀", "version": "9.2.2"}

@app.get("/health")
def health():
    return {"ok": True}


# ────────────────────────────────────────────────────
# BACKGROUND DB SAVE
# ────────────────────────────────────────────────────
def save_to_db(chat_id: str, message: str, response: str):
    db = SessionLocal()
    try:
        db.add(Chat(chat_id=chat_id, message=message, response=response))
        db.commit()
        logger.info(f"💾 Saved message for chat_id={chat_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ DB save error: {e}")
    finally:
        db.close()


# ────────────────────────────────────────────────────
# CHAT — SSE streaming
# ────────────────────────────────────────────────────
@app.post("/chat")
async def chat(data: ChatRequest, background_tasks: BackgroundTasks):
    message = data.message.strip()
    chat_id = str(data.chat_id)

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    logger.info(f"💬 Chat request: chat_id={chat_id} msg_len={len(message)}")

    # RAG context
    try:
        context = search(message, chat_id=chat_id)
        if context and len(context) > 1500:
            context = context[:1500] + "\n...[truncated]"
    except Exception as e:
        logger.error(f"❌ RAG search error: {e}")
        context = ""

    if context:
        prompt = f"""Document context:
{context}

Student question: {message}

Answer from the context. If not found, say so briefly and help generally."""
    else:
        prompt = message

    def token_generator():
        full_response = []
        try:
            for token in stream_llm_response(prompt):
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
                background_tasks.add_task(save_to_db, chat_id, message, complete)
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
def get_chats():
    db = SessionLocal()
    try:
        chats = db.query(Chat).order_by(Chat.id.asc()).all()
        grouped: dict = {}
        for c in chats:
            if c.chat_id not in grouped:
                grouped[c.chat_id] = []
            grouped[c.chat_id].append({"role": "user",      "content": c.message})
            grouped[c.chat_id].append({"role": "assistant", "content": c.response})
        return {"chats": grouped}
    except Exception as e:
        logger.error(f"❌ get_chats error: {e}")
        return {"chats": {}}
    finally:
        db.close()


# ────────────────────────────────────────────────────
# DELETE CHAT
# ────────────────────────────────────────────────────
@app.delete("/chat/{chat_id}")
def delete_chat(chat_id: str):
    db = SessionLocal()
    try:
        deleted = db.query(Chat).filter(Chat.chat_id == chat_id).delete()
        db.commit()
        clear_session(chat_id)
        gc.collect()
        logger.info(f"🗑️ Deleted chat_id={chat_id} rows={deleted}")
        return {"status": "deleted", "rows": deleted}
    except Exception as e:
        db.rollback()
        logger.error(f"❌ delete_chat error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        db.close()


# ────────────────────────────────────────────────────
# PDF UPLOAD
# ────────────────────────────────────────────────────
@app.post("/upload")
async def upload(file: UploadFile = File(...), chat_id: str = "default"):
    logger.info(f"📄 Upload: filename={file.filename} chat_id={chat_id}")
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

        text = extract_text(io.BytesIO(file_bytes))
        if not text or not text.strip():
            raise HTTPException(status_code=422, detail="No readable text found in this file")

        logger.info(f"📄 Extracted {len(text)} chars — now storing in RAG...")

        chunk_count = store_pdf(text, chat_id=chat_id)
        logger.info(f"✅ Stored {chunk_count} chunks for chat_id={chat_id}")

        try:
            meta = get_pdf_metadata(io.BytesIO(file_bytes))
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


# ────────────────────────────────────────────────────
# RAG STATUS
# ────────────────────────────────────────────────────
@app.get("/rag-status")
def rag_status(chat_id: str = "default"):
    return get_stats(chat_id=chat_id)


# ────────────────────────────────────────────────────
# STATS
# ────────────────────────────────────────────────────
@app.get("/stats")
def stats():
    db = SessionLocal()
    try:
        total_messages = db.query(Chat).count()
        total_sessions = db.query(Chat.chat_id).distinct().count()
        return {"total_messages": total_messages, "total_sessions": total_sessions}
    except Exception as e:
        logger.error(f"❌ stats error: {e}")
        return {"total_messages": 0, "total_sessions": 0}
    finally:
        db.close()