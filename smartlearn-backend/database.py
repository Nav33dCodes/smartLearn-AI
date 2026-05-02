from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, Column, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime
import os

# ------------------------
# DATABASE URL
# ------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# 🔥 Railway fix
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# ------------------------
# ENGINE (optimized)
# ------------------------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

# ------------------------
# SESSION
# ------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ------------------------
# BASE
# ------------------------
Base = declarative_base()

# ========================
# 👤 USER MODEL (NEW)
# ========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, index=True, nullable=False)
    password = Column(Text, nullable=False)

    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔗 relationship
    chats = relationship("Chat", back_populates="user", cascade="all, delete")

# ========================
# 💬 CHAT MODEL (UPDATED)
# ========================
class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)

    chat_id = Column(Text, index=True)   # session id (frontend)
    
    # 🔥 NEW: link to user
    user_id = Column(Integer, ForeignKey("users.id"))

    message = Column(Text)
    response = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔗 relationship
    user = relationship("User", back_populates="chats")

# ------------------------
# CREATE TABLES
# ------------------------
Base.metadata.create_all(bind=engine)