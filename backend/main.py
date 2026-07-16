import os
import re
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.services.llm import answer_from_pages
from backend.services.pdf import extract_pages

app = FastAPI(title="SmartLearn Lite API")

origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)
documents: dict[str, dict] = {}


class EchoRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)


class AskRequest(BaseModel):
    document_id: str
    question: str = Field(min_length=2, max_length=1000)


@app.get("/")
def root():
    return {"message": "SmartLearn Lite API is running"}


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/echo")
def echo(body: EchoRequest):
    return {"message": body.message, "length": len(body.message)}


@app.post("/upload")
async def upload(file: UploadFile):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    doc_id = uuid.uuid4().hex[:12]
    save_path = UPLOADS_DIR / f"{doc_id}.pdf"

    content = await file.read()
    save_path.write_bytes(content)

    try:
        pages = extract_pages(str(save_path))
    except ValueError as exc:
        save_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(exc))
    except FileNotFoundError:
        save_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Failed to read uploaded file")

    readable = [p for p in pages if p["text"]]
    if not readable:
        save_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail="No readable text found in this PDF. "
                   "Scanned documents and image-based PDFs (OCR) are not supported.",
        )

    documents[doc_id] = {
        "filename": file.filename,
        "pages": pages,
    }

    return {
        "document_id": doc_id,
        "filename": file.filename,
        "page_count": len(pages),
        "readable_pages": len(readable),
    }


@app.post("/ask")
def ask(body: AskRequest):
    doc = documents.get(body.document_id)
    if doc is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found. Please upload the PDF first via POST /upload.",
        )

    answer = answer_from_pages(doc["pages"], body.question)
    if not answer:
        raise HTTPException(
            status_code=502,
            detail="Failed to generate an answer. Please try again.",
        )

    page_numbers = re.findall(r"\[Page (\d+)\]", answer)
    citations = sorted(set(int(n) for n in page_numbers))

    return {"answer": answer, "citations": citations}
