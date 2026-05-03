from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from services.llm import stream_llm_response
from services.pdf import extract_text, get_pdf_metadata
from services.rag import store_pdf, search, clear_session, get_stats
from database import SessionLocal, Chat

import io
import json
import gc

# ────────────────────────────────────────────────────
# APP
# ────────────────────────────────────────────────────
app = FastAPI(
    title="SmartLearn AI",
    version="2.1.0"
)

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
    return {"status": "SmartLearn AI Running 🚀", "version": "2.1.0"}

@app.get("/health")
def health():
    return {"ok": True}


# ────────────────────────────────────────────────────
# BACKGROUND DB SAVE — doesn't block the stream
# ────────────────────────────────────────────────────
def save_to_db(chat_id: str, message: str, response: str):
    """Runs in background after streaming completes."""
    db = SessionLocal()
    try:
        db.add(Chat(chat_id=chat_id, message=message, response=response))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"DB save error: {e}")
    finally:
        db.close()


# ────────────────────────────────────────────────────
# CHAT — true SSE streaming
# ────────────────────────────────────────────────────
@app.post("/chat")
async def chat(data: ChatRequest, background_tasks: BackgroundTasks):
    message = data.message.strip()
    chat_id = str(data.chat_id)

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    # RAG context
    context = search(message, chat_id=chat_id)

    # FIXED: Trim context to 1500 chars max — long context = slow Groq response
    if context and len(context) > 1500:
        context = context[:1500] + "\n...[truncated]"

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
            err = f"\n\n⚠️ Error: {str(e)}"
            full_response.append(err)
            yield f"data: {json.dumps({'token': err})}\n\n"

        finally:
            complete = "".join(full_response)
            # FIXED: Save to DB in background — doesn't delay stream end
            if complete.strip():
                background_tasks.add_task(save_to_db, chat_id, message, complete)

            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        token_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disables nginx buffering on Railway
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
        gc.collect()  # free RAM from deleted session
        return {"status": "deleted", "rows": deleted}
    except Exception as e:
        db.rollback()
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        db.close()


# ────────────────────────────────────────────────────
# PDF UPLOAD
# ────────────────────────────────────────────────────
@app.post("/upload")
async def upload(file: UploadFile = File(...), chat_id: str = "default"):
    try:
        allowed_types = ("application/pdf", "text/plain")
        allowed_exts  = (".pdf", ".txt", ".doc", ".docx")

        fname = (file.filename or "").lower()
        if file.content_type not in allowed_types and not any(fname.endswith(e) for e in allowed_exts):
            raise HTTPException(status_code=400, detail="Only PDF and text files are supported")

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(status_code=400, detail="File is empty")

        # FIXED: Pass bytes directly — no double BytesIO wrapping
        text = extract_text(io.BytesIO(file_bytes))

        if not text or not text.strip():
            raise HTTPException(status_code=422, detail="No readable text found in this file")

        # Store in RAG (session-isolated)
        chunk_count = store_pdf(text, chat_id=chat_id)

        # Metadata (best effort)
        try:
            meta = get_pdf_metadata(io.BytesIO(file_bytes))
        except Exception:
            meta = {"pages": "?", "title": "", "author": ""}

        # Free memory after processing
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
    finally:
        db.close()