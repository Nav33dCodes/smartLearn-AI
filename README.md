# 

<p align="left">
  <img alt="GitHub Release" src="https://img.shields.io/badge/Release-v15.0.0(Beta)-red?style=flat-square">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11%2B-blue?style=flat-square&logo=python">
  <img alt="React" src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=flat-square">
</p>

SmartLearn AI is a next-generation cognitive architecture and educational assistant. Built from the ground up to deliver uncompromising speed, reliability, and intelligence, the platform seamlessly integrates a sophisticated Retrieval-Augmented Generation (RAG) pipeline with real-time multi-modal AI capabilities. 

**Currently Live at:** [smartlearn.work](https://smartlearn.work)

## Enterprise-Grade Architecture

SmartLearn AI transcends traditional chatbot interfaces by offering a suite of industry-level tools designed for deep analytical research and interactive learning.

### Core Capabilities

- **Zero-Latency Live Code Execution:** An integrated browser-based IDE powered by Sandpack. Users can write, execute, edit, and hot-reload React and JavaScript applications directly inside the chat interface without external dependencies.
- **Autonomous Web Browsing (Playwright):** SmartLearn launches a headless Chromium browser in the background to navigate URLs, wait for page renders, scrape content, and snap live viewport screenshots directly into the chat stream.
- **Zero-Retention Private Mode:** A strict, SOC2-compliant hardware-level privacy feature that bypasses the database completely. Conversations live exclusively in RAM and are permanently destroyed upon closing the session.
- **Multimodal Vision Engine:** Features a highly optimized client-side compression algorithm that processes high-resolution images instantly, routing complex visual data directly to specialized native models (e.g., Gemini 2.5 Flash) while completely avoiding backend token bloat.
- **Advanced Fallback Architecture:** Engineered for 100% uptime. The proprietary router dynamically cascades queries across elite foundational models (including Groq LLaMA 3.3, Google Gemini, and OpenRouter variants).
- **Interactive 3D Flashcards:** Features a mathematically robust parsing engine that sanitizes LLM-hallucinated markdown blocks, rendering study materials into pure CSS 3D perspective glassmorphic flashcards.
- **Visual Knowledge Architecture:** Automatically extracts complex relationships from uploaded documents and plots them into a living, interactive node graph utilizing React Flow.
- **Advanced Voice Mode Engine:** A hyper-realistic, hands-free conversational interface featuring a full-screen dynamic glowing orb. Built with auto-listen mechanics, phase-state orchestration (Listening, Processing, Speaking), and aggressive Whisper audio filters.
- **Enterprise Email Infrastructure (Resend):** A completely overhauled automated email engine featuring official SmartLearn Red branding, dynamic logo injection, and glassmorphic OTP verification boxes.
- **Built-in Bug Reporting:** A seamless, ChatGPT-style bug reporting modal directly in the UI that instantly structures user feedback and directly emails the admin system using our Resend integration.
- **Performance & Traffic Analytics:** Fully integrated with Vercel Web Analytics and Speed Insights to track global latency and user engagement in real-time.

## Technical Stack

The infrastructure is meticulously separated into a high-performance Python backend and a lightning-fast React frontend.

<p align="left">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi">
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img alt="Redis" src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
</p>

### Frontend 
- React 19 (Vite)
- TailwindCSS (Utility-first styling with custom glassmorphism)
- Framer Motion (Fluid 60fps animations and state transitions)
- Vercel Web Analytics & Speed Insights

### Backend
- FastAPI (High-throughput asynchronous routing)
- SQLAlchemy & Neon PostgreSQL (Persistent, encrypted data storage)
- FAISS & Sentence Transformers (In-memory semantic vector search)
- Upstash Redis (Global edge caching for sub-millisecond retrieval)
- Resend (Transactional emails and automated bug reports)

## Development & Deployment

SmartLearn AI is designed for seamless local development using **Docker Compose** and optimized for production deployment on **Vercel** (Frontend) and **Railway** (Backend).

### 1. Local Setup via Docker (Recommended)

You can spin up the entire frontend and backend ecosystem instantly:

```bash
git clone https://github.com/Nav33dCodes/smartLearn-AI.git
cd smartLearn-AI

# Create your .env files in frontend and backend (see templates below)

# Boot the entire stack
docker-compose up -d --build
```
- Frontend will be available at `http://localhost:5173`
- Backend API will be available at `http://localhost:8000`

### 2. Manual Local Setup

**Backend Environment:**
```bash
cd smartlearn-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend Environment:**
```bash
cd smartlearn-frontend
npm install
npm run dev
```

### 3. Production Deployment (Vercel & Railway)

**Frontend (Vercel):**
1. Import the repository into Vercel.
2. Set the Root Directory to `smartlearn-frontend`.
3. Add your `VITE_API_URL` environment variable pointing to your Railway backend.

**Backend (Railway):**
1. Import the repository into Railway.
2. Set the **Root Directory** to `/smartlearn-backend` so Railway detects the production-ready `Dockerfile`.
3. Add your backend environment variables (including Database, Redis, and API keys). Railway will automatically map the `$PORT`.

### Environment Variables Template

Create `.env` inside `smartlearn-backend/`:

<details>
<summary><b>Click to expand Backend Environment Template</b></summary>

```env
# CORS & Routing
ALLOWED_ORIGINS="http://localhost:5173,https://smartlearn.work"
FRONTEND_URL="https://smartlearn.work"

# Security & DB
JWT_SECRET="your_secure_random_string_here"
DATABASE_URL="postgresql://user:password@host:port/dbname"
REDIS_URL="rediss://default:password@host:port"

# Email Configuration (Resend)
SMTP_EMAIL="noreply@smartlearn.work"
RESEND_API_KEY="re_your_api_key"

# AI Model Integrations
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AQ..."
OPENROUTER_API_KEY="sk-or-v1-..."
TAVILY_API_KEY="tvly-..."
YOUTUBE_API_KEY="AIza..."
```
</details>

Create `.env` inside `smartlearn-frontend/`:
```env
VITE_API_URL=https://your-railway-url.up.railway.app
```

## Leadership & Engineering

- **Sanan Malik** – CEO & Visionary
- **Naveed Ahmed** – Lead Architect & Developer

## License

Distributed under the MIT License. See `LICENSE` for more information.
