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

It allows users to:

* 💬 Chat with AI in real-time
* 📄 Upload PDFs and ask questions
* 🧠 Receive intelligent, context-aware answers

---

## ✨ Key Features

* 💬 AI Chat Interface (Groq - LLaMA 3)
* 📄 PDF Upload & Processing
* 🔍 Semantic Search (FAISS)
* 🧠 RAG Pipeline Integration
* ⚡ FastAPI Backend
* 💻 React + Vite Frontend
* 🎨 Clean, modern UI

---

## 🎥 Preview (Add Screenshot Here)

<p align="center">
  <img src="https://via.placeholder.com/800x400.png?text=SmartLearn+Preview" />
</p>

---

## 🏗️ Architecture

```bash
smartlearn/
│
├── frontend/                 # React + Vite frontend
├── backend/                  # FastAPI backend
│   ├── services/
│   │   ├── llm.py
│   │   ├── rag.py
│   │   ├── pdf.py
```

---

## ⚙️ Tech Stack

### 💻 Frontend

* React (Vite)
* Tailwind CSS
* Axios

### ⚙️ Backend

* FastAPI
* Groq API (LLaMA 3)
* Sentence Transformers
* FAISS
* PyPDF

---

## 🧠 RAG Workflow

```mermaid
graph TD;
    A[Upload PDF] --> B[Extract Text];
    B --> C[Chunking];
    C --> D[Embeddings];
    D --> E[FAISS Index];
    F[User Query] --> G[Retrieve Chunks];
    G --> H[LLM (Groq)];
    H --> I[Final Answer];
```

---

## 🚀 Setup Guide (Step-by-Step)

### 🖥️ 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/smartlearn.git
cd smartlearn
```

---

### ⚙️ 2. Backend Setup

```bash
cd backend
```

#### Install dependencies

```bash
pip install -r requirements.txt
```

#### Create `.env`

```env
GROQ_API_KEY=your_api_key_here
```

#### Run server

```bash
uvicorn main:app --reload
```

📍 Backend URL:

```
http://127.0.0.1:8000
```

---

### 💻 3. Frontend Setup

Open new terminal:

```bash
cd frontend
npm install
npm run dev
```

📍 Frontend URL:

```
http://localhost:5173
```

---

## 📡 API Endpoints

### 🔹 POST `/chat`

```json
{
  "message": "Explain AI"
}
```

### 🔹 POST `/upload`

Upload PDF for processing

---

## ⚠️ Notes

* `.env` must remain private
* FAISS is currently in-memory
* Not production-ready yet

---

## 🔮 Roadmap

* [ ] ⚡ Streaming responses (ChatGPT-like)
* [ ] 🗄️ PostgreSQL (chat history)
* [ ] 🔐 Authentication (JWT)
* [ ] ☁️ Deployment (Render / Railway)
* [ ] 📦 Persistent vector DB

---

## 👨‍💻 Authors

* **Sanan Malik**
* **Naveed Ahmed**

---

## 📊 GitHub Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=YOUR_USERNAME&show_icons=true&theme=tokyonight" />
</p>

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
