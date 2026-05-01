from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.llm import get_llm_response
from services.pdf import extract_text
from services.rag import store_pdf, search

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# CHAT WITH RAG
# ------------------------
@app.post("/chat")
async def chat(data: dict):
    message = data["message"]

    # 🔍 Search from RAG
    context = search(message)

    # 🧠 Build prompt
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

    return {"response": response}


# ------------------------
# PDF UPLOAD + STORE IN RAG
# ------------------------
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    text = extract_text(file.file)

    if not text.strip():
        return {"error": "No text found in PDF"}

    store_pdf(text)

    return {"status": "PDF processed and stored"}