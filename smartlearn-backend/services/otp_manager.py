import secrets
import string
import hashlib
import os
from services.redis_client import set_cache, get_cache, delete_cache_pattern

def _hash_otp(email: str, otp: str) -> str:
    secret = os.getenv("JWT_SECRET", "smartlearn_secret")
    return hashlib.sha256(f"{email}:{otp}:{secret}".encode()).hexdigest()

def generate_otp(email: str) -> tuple[str, str]:
    # Generate 6 digit OTP
    otp = "".join(secrets.choice(string.digits) for _ in range(6))
    otp_hash = _hash_otp(email, otp)
    return otp, otp_hash

def verify_otp_hash(email: str, plain_otp: str, hashed_otp: str) -> bool:
    return _hash_otp(email, plain_otp) == hashed_otp

def store_otp(email: str) -> str:
    otp, otp_hash = generate_otp(email)
    # Store in Redis with a 15-minute expiration (900 seconds)
    set_cache(f"otp:{email}", otp_hash, expire_seconds=900)
    return otp

def verify_and_clear_otp(email: str, plain_otp: str) -> bool:
    """Verifies the OTP and clears it from cache to prevent reuse."""
    otp_hash = get_cache(f"otp:{email}")
    if not otp_hash:
        return False
    
    if verify_otp_hash(email, plain_otp, otp_hash):
        delete_cache_pattern(f"otp:{email}")
        return True
    return False

def verify_otp_only(email: str, plain_otp: str) -> bool:
    """Verifies the OTP without clearing it (useful for multi-step flows like password reset)."""
    otp_hash = get_cache(f"otp:{email}")
    if not otp_hash:
        return False
    return verify_otp_hash(email, plain_otp, otp_hash)
