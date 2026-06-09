from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db, User, OTP
from datetime import datetime
from services.auth_logic import get_password_hash, verify_password
from services.jwt_handler import create_access_token, create_refresh_token
from services.otp_manager import store_otp, verify_otp_hash
from services.email_service import send_welcome_email, send_otp_email, send_password_reset_success_email, send_verification_email

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

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class UpdateNameRequest(BaseModel):
    name: str

class UpdateAvatarRequest(BaseModel):
    avatar: str

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.jwt_handler import verify_token

security = HTTPBearer()

def get_current_user_auth(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = verify_token(credentials.credentials, token_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/signup")
def signup(req: SignupRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        name=req.name,
        email=req.email,
        password_hash=get_password_hash(req.password),
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    otp_code = store_otp(req.email)
    background_tasks.add_task(send_verification_email, req.email, req.name, otp_code)
    
    return {"message": "Account created. Please verify your email.", "requires_verification": True, "email": req.email}

@router.post("/verify-account")
def verify_account(req: VerifyOTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
        
    user.is_verified = True
    otp_record.is_used = True
    db.commit()
    
    background_tasks.add_task(send_welcome_email, user.email, user.name)
    
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@router.post("/resend-verification")
def resend_verification(req: ResendVerificationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Don't reveal user existence
        return {"message": "If this email is registered and unverified, a new code has been sent."}
        
    if user.is_verified:
        return {"message": "Account is already verified."}
        
    otp_code = store_otp(user.email)
    background_tasks.add_task(send_verification_email, user.email, user.name, otp_code)
    return {"message": "Verification code resent successfully."}

@router.post("/login")
def login(req: LoginRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.is_verified:
        otp_code = store_otp(user.email)
        background_tasks.add_task(send_verification_email, user.email, user.name, otp_code)
        raise HTTPException(status_code=403, detail="Email not verified. A new verification code has been sent to your email.")
        
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
def reset_password(req: ResetPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
    
    background_tasks.add_task(send_password_reset_success_email, user.email)
    
    return {"message": "Password reset successful"}

@router.put("/user/name")
def update_name(req: UpdateNameRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    current_user.name = req.name.strip()
    db.commit()
    return {"message": "Name updated successfully", "name": current_user.name}

@router.put("/user/avatar")
def update_avatar(req: UpdateAvatarRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    current_user.avatar = req.avatar
    db.commit()
    return {"message": "Avatar updated successfully", "avatar": current_user.avatar}

@router.put("/user/password")
def update_password(req: UpdatePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    if req.current_password == req.new_password:
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")
        
    current_user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
