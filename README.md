<div align="center">

# SmartLearn AI
**The ultimate contextual AI engine.**

[![Build Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/smartLearn-AI/ci.yml?style=flat-square)](https://github.com/YOUR_USERNAME/smartLearn-AI/actions)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Blazing-fast RAG pipelines, live generative UI, and multi-model fallback routing. Built on FastAPI & React.

</div>

---

## ⚡ Overview

SmartLearn AI is an enterprise-grade cognitive architecture designed for researchers and pioneers who demand uncompromising speed. By abandoning traditional document viewers and basic chatbots, SmartLearn introduces a zero-latency environment where your documents are parsed, vectorized, and analyzed at the speed of thought.

## ✨ Unrivaled Capabilities

- **Live Generative UI:** Instantly generate, run, and preview React code directly inside the chat window.
- **Multi-Engine Fallback:** A robust routing system that seamlessly cascades queries between Gemini 2.5, Claude 3.5, and Groq Llama 3 to guarantee 100% uptime.
- **Native Multimodal Vision:** Browser-side compression engines flawlessly analyze visual data with zero API token bloat.
- **Sub-Millisecond Vector Search:** Powered by highly optimized FAISS indices and global edge caching for instantaneous retrieval.
- **OLED-Optimized Aesthetics:** A meticulously crafted, borderless, single-column design language inspired by industry leaders.

## 🏗️ Architecture

SmartLearn AI utilizes a decoupled microservice architecture:

**Frontend Engine (React / Vite)**
- `Tailwind CSS`: Arbitrary OLED values (`#000000`, `white/[0.04]`).
- `Framer Motion`: Fluid, physics-based micro-interactions.
- `Axios`: Optimized API polling and interceptors.

**Backend Inference (Python / FastAPI)**
- `FastAPI`: High-performance asynchronous endpoint routing.
- `LangChain & FAISS`: Intelligent chunking and nearest-neighbor vector retrieval.
- `PyPDF2 & Tesseract`: Deep document parsing and OCR.
- `PostgreSQL`: Durable persistence layer for chat histories and telemetry.

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Nav33dCodes/smartLearn-AI.git
cd smartLearn-AI
```

### 2. Boot the Inference Engine (Backend)
```bash
cd smartlearn-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the ASGI server
uvicorn main:app --reload
```

### 3. Boot the Client (Frontend)
```bash
cd smartlearn-frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to access the local deployment.

## 📁 Repository Structure

```text
smartLearn-AI/
├── .github/workflows/       # CI/CD Pipelines
├── smartlearn-backend/      # FastAPI Server, Vector DBs, ML Models
│   ├── main.py              # Application Entrypoint
│   ├── requirements.txt     # Python Dependencies
│   └── ...
└── smartlearn-frontend/     # React Client
    ├── src/
    │   ├── components/      # UI Elements (Hero, Generative UI, etc.)
    │   ├── pages/           # Views (Landing, Login, App)
    │   └── index.css        # OLED Tailwind Configurations
    └── package.json
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <i>Engineered for the cognitive architecture of tomorrow.</i>
</div>