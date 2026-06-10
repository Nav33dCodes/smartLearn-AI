from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, Column, Integer, Text, DateTime, func, Boolean, ForeignKey, Index
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# ── FIXED: Railway free tier has limited RAM
# pool_size=2 + max_overflow=3
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=2,        
    max_overflow=3,     
    pool_recycle=300,
    pool_timeout=30,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── NEW: High Performance Async Engine for Scaling
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# asyncpg does not support sslmode in the URL query string
if "?sslmode=" in ASYNC_DATABASE_URL:
    ASYNC_DATABASE_URL = ASYNC_DATABASE_URL.split("?")[0]

async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
    connect_args={"ssl": "require"} if "neon.tech" in ASYNC_DATABASE_URL else {}
)
AsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    email = Column(Text, unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=False)
    avatar = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, index=True, nullable=False)
    otp_hash = Column(Text, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)


class Chat(Base):
    __tablename__ = "chats"
    __table_args__ = (
        Index("idx_chat_user_chat_id", "user_id", "chat_id"),
    )

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), index=True, nullable=True) # nullable for backwards compatibility with existing rows
    chat_id    = Column(Text, index=True)
    message    = Column(Text)
    response   = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMetadata(Base):
    __tablename__ = "chat_metadata"
    __table_args__ = (
        Index("idx_meta_user_chat_id", "user_id", "chat_id"),
        Index("idx_meta_user_archived", "user_id", "is_archived"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    chat_id = Column(Text, index=True, unique=True, nullable=False)
    title = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_shared = Column(Boolean, default=False)
    share_id = Column(Text, unique=True, index=True, nullable=True)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session


def get_chat_count(db, chat_id: str) -> int:
    return db.query(func.count(Chat.id)).filter(Chat.chat_id == chat_id).scalar() or 0