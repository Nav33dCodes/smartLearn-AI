import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Pull the secret key from the .env file (Fallback included just in case)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-for-dev-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def create_token(data: dict):
    """Creates a JWT token with an expiration date."""
    to_encode = data.copy()
    
    # Use timezone-aware datetime (utcnow is deprecated in newer Python versions)
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    """Decodes a JWT token and handles expiration/invalid token errors."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        # Catch expired or invalid signatures so your app doesn't crash
        print(f"❌ Token decoding failed: {e}")
        return None