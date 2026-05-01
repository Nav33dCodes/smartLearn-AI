# 🤖 SmartLearn AI

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?color=00F7FF&center=true&vCenter=true&lines=AI+Powered+Learning+Assistant;RAG+Based+Chatbot;FastAPI+%2B+React+System;Built+by+Naveed+%26+Team" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/AI-Groq-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/VectorDB-FAISS-purple?style=for-the-badge" />
</p>

---

## 🧠 Overview

SmartLearn AI is a **full-stack AI-powered learning assistant** that combines modern web technologies with advanced language models and Retrieval-Augmented Generation (RAG).

It enables users to:

* 💬 Chat with AI in real-time
* 📄 Upload PDFs and ask questions
* 🧠 Receive accurate, context-aware answers

---

## ✨ Key Features

* 💬 AI Chat Interface (Groq - LLaMA 3)
* 📄 PDF Upload & Processing
* 🔍 Semantic Search using FAISS
* 🧠 Retrieval-Augmented Generation (RAG)
* ⚡ FastAPI Backend
* 💻 React + Vite Frontend
* 🎨 Clean, responsive UI

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
* FAISS (vector search)
* PyPDF

---

## 🧠 How It Works (RAG Flow)

1. Upload PDF
2. Extract text
3. Split into chunks
4. Convert to embeddings
5. Store in FAISS
6. Ask a question
7. Retrieve relevant chunks
8. Send context to LLM
9. Generate final answer

---

## 🚀 Setup Guide (Run Locally)

### 🔹 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/smartlearn.git
cd smartlearn
```

---

### 🔹 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```env
GROQ_API_KEY=your_api_key_here
```

Run server:

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### 🔹 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 📡 API Endpoints

### POST `/chat`

```json
{
  "message": "Explain machine learning"
}
```

### POST `/upload`

Upload a PDF for processing

---

## ⚠️ Important Notes

* `.env` file must remain private
* `node_modules/` and `__pycache__/` are ignored
* FAISS data is currently in-memory (not persistent)

---

## 🔮 Roadmap

* [ ] Streaming responses (real-time typing)
* [ ] PostgreSQL integration (chat history)
* [ ] Authentication (JWT)
* [ ] Persistent vector database
* [ ] Deployment (Render / Railway / Fly.io)

---

## 🤝 Contributing

Contributions are welcome:

1. Fork the repository
2. Create a new branch
3. Commit changes
4. Open a pull request

---

## 👨‍💻 Authors

* Sanan Malik
* Naveed Ahmed

---

## 📌 Status

🚧 Actively under development
