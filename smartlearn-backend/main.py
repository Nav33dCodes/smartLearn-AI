from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.llm import get_llm_response
from services.pdf import extract_text, get_pdf_metadata
from services.rag import store_pdf, search, clear_session, has_context, get_stats
from database import SessionLocal, Chat

import io

# ────────────────────────────────────────────────────
# APP SETUP
# ────────────────────────────────────────────────────
app = FastAPI(
    title="SmartLearn AI Backend",
    description="Groq-powered learning assistant with RAG and PDF support",
    version="2.0.0"
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
        "version": "2.0.0",
        "features": ["groq-llm", "rag", "pdf-upload", "chat-history"]
    }

@app.get("/health")
def health():
    return {"ok": True}


# ────────────────────────────────────────────────────
# CHAT  (RAG-aware, session-isolated)
# ────────────────────────────────────────────────────
@app.post("/chat")
async def chat(data: ChatRequest):
    db = SessionLocal()
    try:
        message = data.message.strip()
        chat_id = str(data.chat_id)

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        # ── Pull context from RAG (session-aware) ──
        context = search(message, chat_id=chat_id)

        # ── Build smarter prompt ──
        if context:
            prompt = f"""The student has uploaded a document. Use this context to answer:

--- DOCUMENT CONTEXT ---
{context}
--- END CONTEXT ---

Student's question: {message}

Answer based on the context above. If the answer isn't in the context, say so and offer what you know generally."""
        else:
            prompt = message

        # ── Get LLM response ──
        response = get_llm_response(prompt)

        # ── Save to DB ──
        db.add(Chat(chat_id=chat_id, message=message, response=response))
        db.commit()

        return {"response": response}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"error": f"Chat failed: {str(e)}"}
        )
    finally:
        db.close()


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

        # Also clear RAG session for this chat
        clear_session(chat_id)

        return {"status": "deleted", "rows": deleted}
    except Exception as e:
        db.rollback()
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        db.close()


# ────────────────────────────────────────────────────
# PDF UPLOAD  (session-aware, with metadata)
# ────────────────────────────────────────────────────
@app.post("/upload")
async def upload(file: UploadFile = File(...), chat_id: str = "default"):
    try:
        # Validate file type
        if file.content_type not in ("application/pdf", "text/plain") and \
           not (file.filename or "").lower().endswith((".pdf", ".txt", ".doc", ".docx")):
            raise HTTPException(status_code=400, detail="Only PDF and text files are supported")

        file_bytes = await file.read()

        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        # Extract text
        text = extract_text(io.BytesIO(file_bytes))

        if not text or not text.strip():
            raise HTTPException(status_code=422, detail="No readable text found in this file")

        # Store in RAG with session isolation
        chunk_count = store_pdf(text, chat_id=chat_id)

        # Get metadata
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
# RAG STATUS  (useful for frontend to show context badge)
# ────────────────────────────────────────────────────
@app.get("/rag-status")
def rag_status(chat_id: str = "default"):
    return get_stats(chat_id=chat_id)


# ────────────────────────────────────────────────────
# STATS  (optional dashboard endpoint)
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