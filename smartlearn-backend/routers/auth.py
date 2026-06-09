from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db, User, OTP
from datetime import datetime
from services.auth_logic import get_password_hash, verify_password
from services.jwt_handler import create_access_token, create_refresh_token
from services.otp_manager import store_otp, verify_otp_hash
from services.email_service import send_welcome_email, send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

@router.post("/signup")
def signup(req: SignupRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        name=req.name,
        email=req.email,
        password_hash=get_password_hash(req.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    background_tasks.add_task(send_welcome_email, req.email, req.name)
    
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@router.post("/refresh")
def refresh_token(req: RefreshRequest):
    from services.jwt_handler import verify_token
    payload = verify_token(req.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
    user_id = payload.get("sub")
    access_token = create_access_token({"sub": user_id})
    new_refresh_token = create_refresh_token({"sub": user_id})
    return {"access_token": access_token, "refresh_token": new_refresh_token}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"message": "If that email is registered, an OTP has been sent."} # Prevent email enumeration
        
    otp_code = store_otp(user.email)
    background_tasks.add_task(send_otp_email, user.email, otp_code)
    return {"message": "If that email is registered, an OTP has been sent."}

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTP).filter(
        OTP.email == req.email, 
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow()
    ).order_by(OTP.id.desc()).first()
    
    if not otp_record or not verify_otp_hash(req.otp, otp_record.otp_hash):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTP).filter(
        OTP.email == req.email, 
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow()
    ).order_by(OTP.id.desc()).first()
    
    if not otp_record or not verify_otp_hash(req.otp, otp_record.otp_hash):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password_hash = get_password_hash(req.new_password)
    otp_record.is_used = True
    db.commit()
    
    return {"message": "Password reset successful"}
