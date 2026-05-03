from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, Column, Integer, Text, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# ── FIXED: Railway free tier has limited RAM
# pool_size=5 + max_overflow=10 = 15 connections = memory killer
# Reduced to 2+3 which is plenty for a single-user app
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=2,        # was 5 — overkill for Railway free tier
    max_overflow=3,     # was 10 — was eating RAM
    pool_recycle=300,
    pool_timeout=30,
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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_chat_count(db, chat_id: str) -> int:
    return db.query(func.count(Chat.id)).filter(Chat.chat_id == chat_id).scalar() or 0