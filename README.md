# 🤖 SmartLearn AI

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?color=00F7FF&center=true&vCenter=true&lines=AI+Powered+Learning+Assistant;RAG+Based+Chatbot;FastAPI+%2B+React+System;PostgreSQL+Chat+History;Built+by+Team+SmartLearn" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/AI-Groq-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/VectorDB-FAISS-purple?style=for-the-badge" />
</p>

---

## 🧠 Overview

**SmartLearn AI** is a modern full-stack **AI-powered learning assistant** that combines:

* ⚡ FastAPI backend
* 💻 React frontend (Vite)
* 🧠 LLMs (Groq - LLaMA 3)
* 🔍 RAG (Retrieval-Augmented Generation)
* 🗄️ PostgreSQL (persistent chat history)

👉 It allows users to chat with AI and ask questions from uploaded PDFs with context-aware responses.

---

## ✨ Key Feature

* 💬 Real-time AI Chat (Groq API)
* 📄 PDF Upload + Q&A
* 🔍 Semantic Search (FAISS)
* 🧠 Context-aware answers (RAG pipeline)
* 🗄️ Persistent chat history (PostgreSQL)
* 🧹 Chat deletion & multi-chat support
* ⚡ FastAPI high-performance backend
* 🎨 Clean ChatGPT-like UI

---

## 🌐 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://smart-learn-ai-gules.vercel.app |
| Backend  | https://smartlearn-ai-production.up.railway.app |

---

## 🏗️ Project Structure

```bash
smartlearn/
│
├── smartlearn-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│
├── smartlearn-backend/           # FastAPI backend
│   ├── main.py
│   ├── database.py
│   ├── .env                      # secrets (git-ignored, never commit)
│   └── services/
│       ├── llm.py
│       ├── rag.py
│       └── pdf.py
│
├── README.md
└── .gitignore
```

---

## ⚙️ Tech Stack

### 💻 Frontend
* React (Vite)
* Axios
* Tailwind (optional)
* Framer Motion

### ⚙️ Backend
* FastAPI
* Groq API (LLaMA 3)
* Sentence Transformers
* FAISS
* PostgreSQL (SQLAlchemy)

---

## 🚀 Setup Guide

### 🔹 1. Clone Repo

```bash
git clone https://github.com/YOUR_USERNAME/smartlearn.git
cd smartlearn
```

---

### 🔹 2. Backend Setup

```bash
cd smartlearn-backend
pip install -r requirements.txt
```

#### Create `smartlearn-backend/.env`

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=your_railway_public_postgresql_url
ENV=development
```

> ⚠️ **Important:** Use the **public** Railway DB URL, not the internal one.
> Go to Railway → PostgreSQL service → **Variables** tab → copy `DATABASE_PUBLIC_URL`.
> It should look like: `postgresql://postgres:xxxx@monorail.proxy.rlwy.net:PORT/railway`
> The internal URL (`postgres.railway.internal`) only works inside Railway — **not locally**.

#### Run Backend

```bash
uvicorn main:app --reload
```

📍 Runs on `http://127.0.0.1:8000`

---

### 🔹 3. Frontend Setup

```bash
cd smartlearn-frontend
npm install
```

#### Run Frontend

```bash
npm run dev
```

📍 Runs on `http://localhost:5173`

---



## 🌍 How Environment Switching Works

| Where | Environment | CORS policy |
|-------|-------------|-------------|
| Local (`uvicorn --reload`) | development | allows localhost + Vercel |
| Railway (deployed) | production | allows Vercel only |

The backend reads the `ENV` variable to decide which origins CORS allows:
- `development` → allows localhost + Vercel
- `production` → allows Vercel only (no wildcard `*`)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Send a message, get AI response |
| `GET` | `/chats` | Get all chat sessions |
| `GET` | `/chat/{chat_id}` | Get messages for a specific chat |
| `DELETE` | `/chat/{chat_id}` | Delete a chat session |
| `POST` | `/upload` | Upload PDF for RAG |
| `GET` | `/` | Health check |

#### POST `/chat` example

```json
{
  "message": "Explain AI",
  "chat_id": "12345"
}
```

---

## 🧠 How It Works (RAG + DB Flow)

1. 📄 Upload PDF
2. 🔍 Extract text
3. ✂️ Chunking
4. 🧠 Embeddings (Sentence Transformers)
5. 💾 Store in FAISS (in-memory)
6. ❓ User asks question
7. 🔎 Retrieve relevant context
8. 🤖 Generate answer via Groq (LLaMA 3)
9. 🗄️ Save chat in PostgreSQL

---

## 🗄️ Database Schema

```sql
CREATE TABLE chats (
  id         SERIAL PRIMARY KEY,
  chat_id    TEXT,
  message    TEXT,
  response   TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚠️ Important Notes

* 🔒 Never commit `.env` — add it to `.gitignore`
* ⚡ FAISS is in-memory — vector index resets on server restart
* 🌐 Use `DATABASE_PUBLIC_URL` from Railway for local dev, not the internal URL
* 🔐 Keep `GROQ_API_KEY` and `DATABASE_URL` in backend only — never frontend

---

## 🔮 Roadmap

* [ ] 🔐 Authentication (JWT/OAUth)
* [ ] 🧠 Long-term memory
* [ ] 📱 Mobile Optimization
* [ ] 💾 Persistent FAISS index

---

## 🤝 Contributing

1. Fork the repo
2. Create your branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'add: your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 👨‍💻 Team SmartLearn

| Name | Role |
|------|------|
| Sanan Malik | Leader |
| Naveed Ahmed | Developer |
| Dua Fatima | Developer |
| Zeshan Sikandar | Developer |
| Shayan Umer | Developer |
| Fiza Imran | Developer |

---

## 📌 Status

🚧 Actively Developing

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!