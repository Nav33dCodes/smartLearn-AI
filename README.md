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

## ✨ Key Features

* 💬 Real-time AI Chat (Groq API)
* 📄 PDF Upload + Q&A
* 🔍 Semantic Search (FAISS)
* 🧠 Context-aware answers (RAG pipeline)
* 🗄️ Persistent chat history (PostgreSQL)
* 🧹 Chat deletion & multi-chat support
* ⚡ FastAPI high-performance backend
* 🎨 Clean ChatGPT-like UI

---

## 🏗️ Project Structure

```bash
smartlearn/
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   ├── components/
│   ├── App.jsx
│
├── backend/                 # FastAPI backend
│   ├── main.py
│   ├── database.py
│   ├── services/
│   │   ├── llm.py
│   │   ├── rag.py
│   │   ├── pdf.py
│
├── README.md
├── .gitignore
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

## 🧠 How It Works (RAG + DB Flow)

1. 📄 Upload PDF
2. 🔍 Extract text
3. ✂️ Chunking
4. 🧠 Embeddings
5. 💾 Store in FAISS
6. ❓ User asks question
7. 🔎 Retrieve context
8. 🤖 Generate answer
9. 🗄️ Save chat in PostgreSQL

---

## 🚀 Setup Guide

## 🔹 1. Clone Repo

```bash
git clone https://github.com/YOUR_USERNAME/smartlearn.git
cd smartlearn
```

---

## 🔹 2. Backend Setup

```bash
cd smartlearn-backend
pip install -r requirements.txt
```

### Create `.env`

```env
GROQ_API_KEY=your_api_key
DATABASE_URL=your_postgresql_url
```

---

### Run Backend

```bash
uvicorn main:app --reload
```

📍 http://127.0.0.1:8000

---

## 🔹 3. Frontend Setup

```bash
cd smartlearn-frontend
npm install
npm run dev
```

📍 http://localhost:5173

---

## 📡 API Endpoints

### 🔹 POST `/chat`

```json
{
  "message": "Explain AI",
  "chat_id": "12345"
}
```

---

### 🔹 GET `/chats`

Returns grouped chat history.

---

### 🔹 DELETE `/chat/{chat_id}`

Deletes full chat session.

---

### 🔹 POST `/upload`

Upload PDF for RAG.

---

## 🗄️ Database (PostgreSQL)

* Stores chat history
* Supports multi-chat sessions
* Linked via `chat_id`

Example table:

```sql
id | chat_id | message | response
```

---

## ⚠️ Important Notes

* 🔒 Never commit `.env`
* ⚡ FAISS is in-memory (temporary)
* 🧠 Chat history stored in PostgreSQL
* 🌐 CORS must match frontend URL

---

## 🔮 Roadmap

* [ ] 🔄 Real-time streaming (SSE/WebSocket)
* [ ] 🔐 Authentication (JWT)
* [ ] 🧠 Long-term memory
* [ ] 📱 Mobile optimization
* [ ] ☁️ Full cloud deployment

---

## 🤝 Contributing

1. Fork repo
2. Create branch
3. Commit changes
4. Open PR

---

## 👨‍💻 Team SmartLearn

* Sanan Malik (Leader)
* Naveed Ahmed
* Dua Fatima
* Zeshan Sikandar
* Shayan Umer
* Fiza Imran

---

## 📌 Status

🚧 Actively Developing

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---

## 🌐 Live Demo

Frontend: https://smartlearn-ai-liard.vercel.app
Backend: https://smartlearn-ai-production.up.railway.app

---
