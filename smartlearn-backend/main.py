from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.llm import get_llm_response
from services.pdf import extract_text
from services.rag import store_pdf, search
from database import SessionLocal, Chat  

app = FastAPI()

# ------------------------
# HEALTH CHECK
# ------------------------
@app.get("/")
def root():
    return {"status": "SmartLearn Backend Running 🚀"}

# ------------------------
# CORS
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smart-learn-ai-gules.vercel.app/", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# CHAT WITH RAG + SAVE TO DB
# ------------------------
@app.post("/chat")
async def chat(data: dict):
    db = SessionLocal()
    try:
        message = data.get("message", "")
        chat_id = str(data.get("chat_id", "default"))  # ensure string

        if not message:
            return {"error": "Message is required"}

        context = search(message)

        prompt = f"""
You are SmartLearn AI.

Context:
{context}

User:
{message}
"""

        response = get_llm_response(prompt)

        # ✅ SAVE
        new_chat = Chat(
            chat_id=chat_id,
            message=message,
            response=response
        )

        db.add(new_chat)
        db.commit()

        return {"response": response}

    except Exception as e:
        return {"error": str(e)}

    finally:
        db.close()


# ------------------------
# GET ALL CHATS (GROUPED BY CHAT_ID)
# ------------------------
@app.get("/chats")
def get_chats():
    db = SessionLocal()
    try:
        chats = db.query(Chat).order_by(Chat.id.asc()).all()

        grouped = {}

        for c in chats:
            if c.chat_id not in grouped:
                grouped[c.chat_id] = []

            grouped[c.chat_id].append({
                "role": "user",
                "content": c.message
            })
            grouped[c.chat_id].append({
                "role": "assistant",
                "content": c.response
            })

        return {"chats": grouped}

    finally:
        db.close()

# ------------------------
# DELETE CHAT BY CHAT_ID
# ------------------------
@app.delete("/chat/{chat_id}")
def delete_chat(chat_id: str):
    db = SessionLocal()
    try:
        db.query(Chat).filter(Chat.chat_id == chat_id).delete()
        db.commit()
        return {"status": "deleted"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


# ------------------------
# PDF UPLOAD
# ------------------------
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        text = extract_text(file.file)

        if not text or not text.strip():
            return {"error": "No text found in PDF"}

        store_pdf(text)

        return {"status": "PDF processed and stored"}

    except Exception as e:
        return {"error": str(e)}