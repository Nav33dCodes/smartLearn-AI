from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from services.llm import stream_llm_response          # ← streaming
from services.pdf import extract_text, get_pdf_metadata
from services.rag import store_pdf, search, clear_session, has_context, get_stats
from database import SessionLocal, Chat

import io
import json

# ────────────────────────────────────────────────────
# APP SETUP
# ──────────────────────────────────────────────────── 
app = FastAPI(
    title="SmartLearn AI Backend",
    description="Groq-powered learning assistant with RAG, streaming, and PDF support",
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
# SCHEMAS
# ────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    chat_id: str = "default"


# ────────────────────────────────────────────────────
# HEALTH
# ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "SmartLearn Backend Running 🚀",
        "version": "2.1.0",
        "features": ["groq-streaming", "rag", "pdf-upload", "chat-history"]
    }

@app.get("/health")
def health():
    return {"ok": True}


# ────────────────────────────────────────────────────
# CHAT  — true SSE streaming
# ────────────────────────────────────────────────────
@app.post("/chat")
async def chat(data: ChatRequest):
    message = data.message.strip()
    chat_id = str(data.chat_id)

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    # ── RAG context (session-aware) ──
    context = search(message, chat_id=chat_id)

    # ── Build prompt ──
    if context:
        prompt = f"""The student has uploaded a document. Use this context to answer:

--- DOCUMENT CONTEXT ---
{context}
--- END CONTEXT ---

Student's question: {message}

Answer based on the context above. If the answer isn't in the context, say so and offer what you know generally."""
    else:
        prompt = message

    # ── SSE generator ──
    def token_generator():
        full_response = []

        try:
            for token in stream_llm_response(prompt):
                full_response.append(token)
                # SSE format — each line must be: data: {...}\n\n
                yield f"data: {json.dumps({'token': token})}\n\n"

        except Exception as e:
            err_token = f"\n\n⚠️ Stream error: {str(e)}"
            full_response.append(err_token)
            yield f"data: {json.dumps({'token': err_token})}\n\n"

        finally:
            # ── Save complete response to DB ──
            complete = "".join(full_response)
            if complete.strip():
                db = SessionLocal()
                try:
                    db.add(Chat(
                        chat_id=chat_id,
                        message=message,
                        response=complete
                    ))
                    db.commit()
                except Exception:
                    db.rollback()
                finally:
                    db.close()

            # ── Signal end of stream ──
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        token_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",   # disables nginx buffering (Railway)
        }
    )


# ────────────────────────────────────────────────────
# GET ALL CHATS  (grouped by chat_id)
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
        if file.content_type not in ("application/pdf", "text/plain") and \
           not (file.filename or "").lower().endswith((".pdf", ".txt", ".doc", ".docx")):
            raise HTTPException(status_code=400, detail="Only PDF and text files are supported")

        file_bytes = await file.read()

        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        text = extract_text(io.BytesIO(file_bytes))

        if not text or not text.strip():
            raise HTTPException(status_code=422, detail="No readable text found in this file")

        chunk_count = store_pdf(text, chat_id=chat_id)

        try:
            meta = get_pdf_metadata(io.BytesIO(file_bytes))
        except Exception:
            meta = {"pages": "?", "title": "", "author": ""}

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
        return {
            "total_messages": total_messages,
            "total_sessions": total_sessions,
        }
    finally:
        db.close()