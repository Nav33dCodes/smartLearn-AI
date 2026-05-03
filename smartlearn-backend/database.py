from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, Column, Integer, Text, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables")

# Railway / older postgres URL fix
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # detects stale connections
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,     # recycle connections every 5 min (prevents timeout drops)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Chat(Base):
    __tablename__ = "chats"

    id         = Column(Integer, primary_key=True, index=True)
    chat_id    = Column(Text, index=True)
    message    = Column(Text)
    response   = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


# ── Helpers ──────────────────────────────────────────

def get_db():
    """Dependency-style DB session (use as context manager or in FastAPI Depends)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_chat_count(db, chat_id: str) -> int:
    """Return number of messages in a chat session."""
    return db.query(func.count(Chat.id)).filter(Chat.chat_id == chat_id).scalar() or 0