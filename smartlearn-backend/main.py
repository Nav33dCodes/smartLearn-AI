from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from services.llm import get_llm_response
from services.pdf import extract_text
from services.rag import store_pdf, search

from database import SessionLocal, Chat, User

# 🔐 AUTH IMPORTS
from auth.schemas import UserSignup, UserLogin
from auth.utils import hash_password, verify_password
from auth.jwt_handler import create_token
from auth.dependencies import get_current_user, get_db
from auth.email import send_welcome_email

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
    allow_origins=[
        "https://smartlearn-ai-sigma.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# 🔐 AUTH ROUTES
# ========================

@app.post("/signup")
async def signup(data: UserSignup, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        return {"error": "User already exists"}

    new_user = User(
        email=data.email,
        password=hash_password(data.password)
    )

    db.add(new_user)
    db.commit()

    # 📧 send welcome email
    try:
        await send_welcome_email(data.email)
    except Exception as e:
        print("Email error:", e)

    return {"message": "User created successfully"}


@app.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password):
        return {"error": "Invalid credentials"}

    token = create_token({"user_id": user.id})

    return {"token": token}


# ========================
# 💬 CHAT (PROTECTED)
# ========================

@app.post("/chat")
async def chat(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        message = data.get("message", "")
        chat_id = str(data.get("chat_id", "default"))

        if not message:
            return {"error": "Message is required"}

        # 🔍 RAG
        context = search(message)

        prompt = f"""
You are SmartLearn AI.

Context:
{context}

User:
{message}
"""

        response = get_llm_response(prompt)

        # ✅ SAVE WITH USER
        new_chat = Chat(
            chat_id=chat_id,
            user_id=current_user.id,
            message=message,
            response=response
        )

        db.add(new_chat)
        db.commit()

        return {"response": response}

    except Exception as e:
        return {"error": str(e)}


# ========================
# 📜 GET USER CHATS
# ========================

@app.get("/chats")
def get_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chats = db.query(Chat)\
        .filter(Chat.user_id == current_user.id)\
        .order_by(Chat.id.asc())\
        .all()

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


# ========================
# ❌ DELETE CHAT
# ========================

@app.delete("/chat/{chat_id}")
def delete_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db.query(Chat)\
            .filter(Chat.chat_id == chat_id)\
            .filter(Chat.user_id == current_user.id)\
            .delete()

        db.commit()

        return {"status": "deleted"}

    except Exception as e:
        return {"error": str(e)}


# ========================
# 📄 PDF UPLOAD
# ========================

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