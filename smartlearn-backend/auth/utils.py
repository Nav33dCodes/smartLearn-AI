from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """Hash plain password safely"""
    return pwd_context.hash(password[:72])  # 🔥 critical fix


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password safely"""
    try:
        return pwd_context.verify(plain_password[:72], hashed_password)
    except Exception as e:
        print(f"❌ Password verify error: {e}")
        return False