from auth.schemas import ForgotPassword, ResetPassword
from auth.jwt_handler import create_reset_token, decode_token
from auth.email import send_reset_email
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from services.llm import get_llm_response
from services.pdf import extract_text
from services.rag import store_pdf, search

from database import Chat, User

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
        "http://localhost:5173",
        "https://smartlearn-ai-xi.vercel.app/"
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
    email = data.email.lower()

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        email=email,
        password=hash_password(data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 📧 non-blocking email
    try:
        await send_welcome_email(email)
    except Exception as e:
        print("Email error:", e)

    return {"message": "User created successfully"}


@app.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    email = data.email.lower()

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 🔥 FIXED
    token = create_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer"
    }
@app.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    email = data.email.lower()

    user = db.query(User).filter(User.email == email).first()

    # 🔐 security: don't reveal if user exists
    if not user:
        return {"message": "If email exists, reset link sent"}

    token = create_reset_token(email)

    try:
        await send_reset_email(email, token)
    except Exception as e:
        print("Email error:", e)

    return {"message": "Reset link sent to email"}

@app.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    payload = decode_token(data.token, expected_type="reset")

    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    email = payload.get("sub")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}

# ========================
# 💬 CHAT (PROTECTED)
# ========================

@app.post("/chat")
async def chat(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = data.get("message")

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    chat_id = str(data.get("chat_id") or uuid.uuid4())

    context = search(message)

    prompt = f"""
You are SmartLearn AI.

Context:
{context}

User:
{message}
"""

    response = get_llm_response(prompt)

    new_chat = Chat(
        chat_id=chat_id,
        user_id=current_user.id,
        message=message,
        response=response
    )

    db.add(new_chat)
    db.commit()

    return {"response": response}


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
        .order_by(Chat.id.desc())\
        .all()

    grouped = {}

    for c in chats:
        if c.chat_id not in grouped:
            grouped[c.chat_id] = []

        grouped[c.chat_id].append({"role": "user", "content": c.message})
        grouped[c.chat_id].append({"role": "assistant", "content": c.response})

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
    db.query(Chat)\
        .filter(Chat.chat_id == chat_id)\
        .filter(Chat.user_id == current_user.id)\
        .delete()

    db.commit()

    return {"status": "deleted"}


# ========================
# 📄 PDF UPLOAD (PROTECTED)
# ========================

@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    text = extract_text(file.file)

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="No text found in PDF")

    store_pdf(text)

    return {"status": "PDF processed and stored"}