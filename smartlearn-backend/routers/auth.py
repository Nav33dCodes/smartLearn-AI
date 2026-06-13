from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db, User, OTP
from datetime import datetime
from services.auth_logic import get_password_hash, verify_password
from services.jwt_handler import create_access_token, create_refresh_token
from services.otp_manager import store_otp, verify_and_clear_otp, verify_otp_only
from services.email_service import send_welcome_email, send_otp_email, send_password_reset_success_email, send_verification_email, send_delete_account_otp_email
from database import Chat, ChatMetadata

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

class DeleteAccountRequest(BaseModel):
    otp: str

class UpdatePersonalizationRequest(BaseModel):
    nickname: str = ""
    occupation: str = ""
    style_tone: str = ""
    custom_instructions: str = ""

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
    from services.redis_client import check_rate_limit
    if not check_rate_limit(f"ratelimit:otp:{req.email}", max_requests=5, window_seconds=300):
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
        
    if not verify_and_clear_otp(req.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_verified = True
    db.commit()
    
    background_tasks.add_task(send_welcome_email, user.email, user.name)
    
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": {"id": user.id, "name": user.name, "email": user.email, "avatar": user.avatar, "nickname": user.nickname, "occupation": user.occupation, "style_tone": user.style_tone, "custom_instructions": user.custom_instructions}}

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
    return {"access_token": access_token, "refresh_token": refresh_token, "user": {"id": user.id, "name": user.name, "email": user.email, "avatar": user.avatar, "nickname": user.nickname, "occupation": user.occupation, "style_tone": user.style_tone, "custom_instructions": user.custom_instructions}}

@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        from services.jwt_handler import SECRET_KEY, ALGORITHM
        import jwt
        import time
        from services.redis_client import set_cache
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        if exp:
            ttl = int(exp - time.time())
            if ttl > 0:
                # Blacklist the token until it naturally expires
                set_cache(f"blacklist:{token}", "logged_out", expire_seconds=ttl)
    except Exception:
        pass
    return {"message": "Logged out securely"}

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
    from services.redis_client import check_rate_limit
    if not check_rate_limit(f"ratelimit:otp:{req.email}", max_requests=5, window_seconds=300):
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
        
    if not verify_otp_only(req.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    from services.redis_client import check_rate_limit
    if not check_rate_limit(f"ratelimit:otp:{req.email}", max_requests=5, window_seconds=300):
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
        
    if not verify_and_clear_otp(req.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    
    background_tasks.add_task(send_password_reset_success_email, user.email)
    
    return {"message": "Password reset successful"}

@router.put("/user/name")
def update_name(req: UpdateNameRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    current_user.name = req.name.strip()
    db.commit()
    from services.redis_client import delete_cache
    delete_cache(f"user_profile:{current_user.id}")
    return {"message": "Name updated successfully", "name": current_user.name}

@router.put("/user/avatar")
def update_avatar(req: UpdateAvatarRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    current_user.avatar = req.avatar
    db.commit()
    from services.redis_client import delete_cache
    delete_cache(f"user_profile:{current_user.id}")
    return {"message": "Avatar updated successfully", "avatar": current_user.avatar}

@router.get("/user/me")
def get_user_profile(current_user: User = Depends(get_current_user_auth)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar": current_user.avatar,
        "nickname": current_user.nickname,
        "occupation": current_user.occupation,
        "style_tone": current_user.style_tone,
        "custom_instructions": current_user.custom_instructions
    }

@router.put("/user/password")
def update_password(req: UpdatePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    if req.current_password == req.new_password:
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")
        
    current_user.password_hash = get_password_hash(req.new_password)
    db.commit()
    from services.redis_client import delete_cache
    delete_cache(f"user_profile:{current_user.id}")
    return {"message": "Password updated successfully"}

@router.get("/user/export")
def export_user_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    user_data = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
    
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).all()
    metadata = db.query(ChatMetadata).filter(ChatMetadata.user_id == current_user.id).all()
    
    return {
        "user": user_data,
        "chat_metadata": [{"chat_id": m.chat_id, "title": m.title, "is_pinned": m.is_pinned} for m in metadata],
        "messages": [{"chat_id": c.chat_id, "role": "user", "content": c.message} for c in chats] + \
                    [{"chat_id": c.chat_id, "role": "assistant", "content": c.response} for c in chats]
    }

@router.delete("/user/chats")
def delete_all_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    from services.redis_client import delete_cache
    chats = db.query(ChatMetadata).filter(ChatMetadata.user_id == current_user.id).all()
    for chat in chats:
        delete_cache(f"chat_messages:{chat.chat_id}")
    
    db.query(Chat).filter(Chat.user_id == current_user.id).delete()
    db.query(ChatMetadata).filter(ChatMetadata.user_id == current_user.id).delete()
    db.commit()
    
    delete_cache(f"user_chats:{current_user.id}")
    return {"message": "All chats deleted successfully"}

@router.post("/user/delete-request")
def request_account_deletion(background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    otp_code = store_otp(current_user.email)
    background_tasks.add_task(send_delete_account_otp_email, current_user.email, current_user.name, otp_code)
    return {"message": "OTP sent to your email for account deletion verification."}

@router.put("/personalization")
def update_personalization(req: UpdatePersonalizationRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    current_user.nickname = req.nickname
    current_user.occupation = req.occupation
    current_user.style_tone = req.style_tone
    current_user.custom_instructions = req.custom_instructions
    db.commit()
    db.refresh(current_user)
    
    from services.redis_client import set_cache
    cache_key = f"user_profile:{current_user.id}"
    set_cache(cache_key, {
        "id": current_user.id, "name": current_user.name, "email": current_user.email, "avatar": current_user.avatar,
        "nickname": current_user.nickname or "",
        "occupation": current_user.occupation or "",
        "style_tone": current_user.style_tone or "",
        "custom_instructions": current_user.custom_instructions or ""
    }, expire_seconds=3600)
    
    return {
        "message": "Personalization settings updated",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "nickname": current_user.nickname,
            "occupation": current_user.occupation,
            "style_tone": current_user.style_tone,
            "custom_instructions": current_user.custom_instructions
        }
    }

@router.delete("/user/account")
def delete_account(req: DeleteAccountRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_auth)):
    if not verify_and_clear_otp(current_user.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    from services.redis_client import delete_cache
    chats = db.query(ChatMetadata).filter(ChatMetadata.user_id == current_user.id).all()
    for chat in chats:
        delete_cache(f"chat_messages:{chat.chat_id}")
        
    db.query(Chat).filter(Chat.user_id == current_user.id).delete()
    db.query(ChatMetadata).filter(ChatMetadata.user_id == current_user.id).delete()
    db.delete(current_user)
    db.commit()
    
    delete_cache(f"user_profile:{current_user.id}")
    delete_cache(f"user_chats:{current_user.id}")
    
    return {"message": "Account deleted successfully"}
