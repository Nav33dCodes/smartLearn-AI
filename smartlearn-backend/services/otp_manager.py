import secrets
import string
from passlib.context import CryptContext
from datetime import datetime, timedelta
from database import SessionLocal, OTP

otp_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_otp() -> tuple[str, str]:
    # Generate 6 digit OTP
    otp = "".join(secrets.choice(string.digits) for _ in range(6))
    otp_hash = otp_context.hash(otp)
    return otp, otp_hash

def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    return otp_context.verify(plain_otp, hashed_otp)

def store_otp(email: str) -> str:
    otp, otp_hash = generate_otp()
    db = SessionLocal()
    try:
        # Expire old OTPs
        db.query(OTP).filter(OTP.email == email).update({"is_used": True})
        
        new_otp = OTP(
            email=email,
            otp_hash=otp_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=15)
        )
        db.add(new_otp)
        db.commit()
        return otp
    finally:
        db.close()
