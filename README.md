# 🤖 SmartLearn AI

SmartLearn AI is a **full-stack AI-powered learning assistant** that combines modern web technologies with advanced language models and Retrieval-Augmented Generation (RAG).

It enables users to interact with intelligent AI, upload documents, and receive **context-aware, accurate answers** in real time.

---

## ✨ Key Features

* 💬 **AI Chat Interface** powered by Groq (LLaMA 3)
* 📄 **PDF Upload & Processing**
* 🔍 **Semantic Search** using FAISS vector database
* 🧠 **Retrieval-Augmented Generation (RAG)**
* ⚡ **FastAPI Backend** for high performance
* 💻 **Modern Frontend** built with React + Vite
* 🎨 Clean, responsive, and user-friendly UI

---

## 🏗️ Architecture Overview

```
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

### Frontend

* React (Vite)
* Tailwind CSS *(optional but recommended)*
* Axios

### Backend

* FastAPI
* Groq API (LLaMA 3)
* Sentence Transformers
* FAISS (vector similarity search)
* PyPDF

---

## 🧠 How It Works (RAG Pipeline)

1. User uploads a PDF document
2. Text is extracted and cleaned
3. Content is split into smaller chunks
4. Each chunk is converted into embeddings
5. Stored in FAISS vector index
6. User submits a query
7. Relevant chunks are retrieved
8. Context + query sent to LLM
9. AI generates a precise, contextual response

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smartlearn.git
cd smartlearn
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### 3️⃣ Frontend Setup

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

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
GROQ_API_KEY=your_api_key_here
```

> ⚠️ Never commit your `.env` file to version control.

---

## 📡 API Endpoints

### POST `/chat`

Send a message to the AI:

```json
{
  "message": "Explain machine learning"
}
```

---

### POST `/upload`

Upload a PDF document for processing and indexing.

---

## 🧪 Usage

1. Start backend server
2. Start frontend application
3. Open the app in your browser
4. Chat with the AI or upload a PDF
5. Ask context-based questions

---

## ⚠️ Important Notes

* `node_modules/` and `__pycache__/` are ignored
* `.env` is private and must not be shared
* FAISS index is currently **in-memory (non-persistent)**

---

## 🔮 Roadmap

* [ ] Streaming responses (real-time typing)
* [ ] PostgreSQL integration (chat history)
* [ ] Authentication (JWT-based)
* [ ] Persistent vector database (e.g., Pinecone / Weaviate)
* [ ] Deployment (Render / Railway / Fly.io)
* [ ] UI/UX improvements

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Submit a pull request

---

## 👨‍💻 Authors

* **Sanan Malik**
* **Naveed Ahmed**

---

## 📌 Project Status

🚧 Actively under development
🔥 Continuously improving performance and features

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub!
