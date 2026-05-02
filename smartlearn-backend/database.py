from dotenv import load_dotenv
load_dotenv()


from sqlalchemy import create_engine, Column, Integer, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL")

# 🔥 Safety check
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# 🔥 Railway fix (important)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# ⚡ Engine config (smooth performance)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # avoids stale connections
    pool_size=5,          # small but efficient
    max_overflow=10       # handles traffic spikes
)

# 🧠 Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 📦 Base
Base = declarative_base()

# 💬 Chat Model
class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Text, index=True)   # 🔥 fast lookup
    message = Column(Text)
    response = Column(Text)

    # ⏱ future-proof (no breaking change)
    created_at = Column(DateTime, default=datetime.utcnow)

# 🏗 create tables
Base.metadata.create_all(bind=engine)