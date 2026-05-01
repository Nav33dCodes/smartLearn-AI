# SmartLearn AI 🤖

SmartLearn AI is a full-stack AI-powered chatbot that combines modern web technologies with advanced language models and Retrieval-Augmented Generation (RAG).

It allows users to:

* Chat with an AI assistant ⚡
* Upload PDFs and ask questions from them 📄
* Get intelligent, context-aware responses 🧠

---

## 🚀 Features

* 💬 AI Chat using Groq (LLaMA 3)
* 📄 PDF Upload & Processing
* 🔍 Semantic Search with FAISS
* 🧠 RAG (Retrieval-Augmented Generation)
* ⚡ FastAPI Backend
* 💻 React + Vite Frontend
* 🎨 Clean and modern UI

---

## 🏗️ Project Architecture

```
smartlearn/
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│
├── backend/                 # FastAPI backend
│   ├── main.py
│   ├── services/
│   │   ├── llm.py           # Groq API integration
│   │   ├── rag.py           # FAISS + embeddings
│   │   ├── pdf.py           # PDF text extraction
│   │
│   ├── requirements.txt
│
├── .gitignore
├── README.md
```

---

## ⚙️ Tech Stack

### 🔹 Frontend

* React (Vite)
* Tailwind CSS (if used)
* Axios (API calls)

### 🔹 Backend

* FastAPI
* Groq API (LLaMA 3 model)
* Sentence Transformers
* FAISS (vector search)
* PyPDF

---

## 🧠 How It Works (RAG Flow)

1. User uploads a PDF
2. Text is extracted from PDF
3. Text is split into chunks
4. Chunks are converted into embeddings
5. Stored in FAISS vector database
6. User asks a question
7. Relevant chunks are retrieved
8. Sent to LLM with context
9. AI generates accurate answer

---

## 🚀 Getting Started (Local Setup)

### 🔹 1. Clone Repository

```
git clone https://github.com/YOUR_USERNAME/smartlearn.git
cd smartlearn
```

---

### 🔹 2. Backend Setup

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```

---

### 🔹 3. Frontend Setup

Open new terminal:

```
cd frontend
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file inside `backend/`:

```
GROQ_API_KEY=your_api_key_here

---

## 📡 API Endpoints

### 🔹 POST `/chat`

Send message to AI:

```
{
  "message": "Explain machine learning"
}
```

---

### 🔹 POST `/upload`

Upload PDF for RAG processing

---

## 🧪 Testing the Project

* Start backend first
* Then start frontend
* Open frontend in browser
* Chat or upload PDF

---

## ⚠️ Important Notes

* `node_modules/` is excluded from GitHub
* `__pycache__/` is excluded
* `.env` must remain private
* FAISS data is stored in memory (not persistent yet)

---

## 🔮 Future Improvements

* PostgreSQL (store chat history)
* User authentication (JWT)
* Persistent vector database
* Streaming responses (like ChatGPT)
* Deployment (Render / Railway / Fly.io)

---

## 👨‍💻 Authors

* **Sanan Malik**
* **Naveed Ahmed**

---

## 📌 Status

🚧 Currently under development
🔥 Actively improving features and performance

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
