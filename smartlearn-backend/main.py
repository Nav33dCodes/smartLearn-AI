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
    allow_origins=["*"],  # later replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# CHAT WITH RAG + SAVE TO DB
# ------------------------
@app.post("/chat")
async def chat(data: dict):
    try:
        message = data.get("message", "")

        if not message:
            return {"error": "Message is required"}

        # 🔍 RAG search
        context = search(message)

        # 🧠 Prompt
        prompt = f"""
You are SmartLearn AI.

Use the context below to answer.
If context is empty, answer normally.

Context:
{context}

User Question:
{message}
"""

        response = get_llm_response(prompt)

        # ✅ SAVE TO DATABASE (THIS IS NEW)
        db = SessionLocal()
        new_chat = Chat(message=message, response=response)
        db.add(new_chat)
        db.commit()
        db.close()

        return {"response": response}

    except Exception as e:
        return {"error": str(e)}

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