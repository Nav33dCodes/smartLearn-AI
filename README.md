# 🤖 SmartLearn AI

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?color=00F7FF&center=true&vCenter=true&lines=AI+Powered+Learning+Assistant;RAG+Based+Chatbot;FastAPI+%2B+React+System;Built+by+Team+SmartLearn" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/AI-Groq-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/VectorDB-FAISS-purple?style=for-the-badge" />
</p>

---

## 🧠 Overview

**SmartLearn AI** is a modern, full-stack **AI-powered learning assistant** that combines:

* ⚡ FastAPI backend
* 💻 React frontend
* 🧠 LLMs (Groq - LLaMA 3)
* 🔍 Retrieval-Augmented Generation (RAG)

It enables users to interact with AI intelligently by combining real-time chat with document-based knowledge.

---

## ✨ Key Features

* 💬 Real-time AI Chat (Groq API - LLaMA 3)
* 📄 PDF Upload & Intelligent Q&A
* 🔍 Semantic Search with FAISS
* 🧠 Context-aware Responses (RAG)
* ⚡ High-performance FastAPI backend
* 💻 React + Vite frontend
* 🎨 Clean & responsive UI

---

## 🏗️ Project Structure

```bash
smartlearn/
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│
├── backend/                  # FastAPI backend
│   ├── main.py
│   ├── services/
│   │   ├── llm.py            # Groq API integration
│   │   ├── rag.py            # FAISS + embeddings
│   │   ├── pdf.py            # PDF processing
│   │
│   ├── requirements.txt
│
├── .gitignore
├── README.md
```

---

## ⚙️ Tech Stack

### 💻 Frontend

* React (Vite)
* Tailwind CSS *(optional)*
* Axios

### ⚙️ Backend

* FastAPI
* Groq API (LLaMA 3)
* Sentence Transformers
* FAISS (Vector Search)
* PyPDF

---

## 🧠 How It Works (RAG Pipeline)

1. 📄 Upload PDF
2. 🔍 Extract text
3. ✂️ Split into chunks
4. 🧠 Convert into embeddings
5. 💾 Store in FAISS
6. ❓ Ask a question
7. 🔎 Retrieve relevant chunks
8. 🤖 Send context to LLM
9. 💡 Generate final answer

---

## 🚀 Setup Guide

### 🔹 1. Clone Repository

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

Create `.env` file:

```env
GROQ_API_KEY=your_api_key_here
```

Run backend:

```bash
uvicorn main:app --reload
```

📍 Backend URL:
http://127.0.0.1:8000

---

### 🔹 3. Frontend Setup

```bash
cd smartlearn-frontend
npm install
npm run dev
```

📍 Frontend URL:
http://localhost:5173

---

## 📡 API Endpoints

### 🔹 POST `/chat`

```json
{
  "message": "Explain machine learning"
}
```

### 🔹 POST `/upload`

Upload a PDF file for processing and querying.

---

## ⚠️ Important Notes

* 🔒 Keep `.env` file private
* 🚫 `node_modules/` and `__pycache__/` are ignored
* ⚡ FAISS is currently **in-memory (non-persistent)**

---

## 🔮 Roadmap

* [ ] 🔄 Streaming responses (real-time typing)
* [ ] 🗄️ PostgreSQL integration (chat history)
* [ ] 🔐 Authentication (JWT)
* [ ] 💾 Persistent vector database
* [ ] 🌍 Deployment (Render / Railway / Fly.io)
* [ ] 📱 Mobile responsiveness improvements

---

## 🤝 Contributing

Contributions are welcome! 🚀

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 👨‍💻 Team SmartLearn

* Sanan Malik (Leader)
* Naveed Ahmed
* Dua Fatima
* Zeshan Sikandar
* Shayan Umer
* Fiza Imran

---

## 📌 Project Status

🚧 **Actively Under Development**

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub — it really helps!
