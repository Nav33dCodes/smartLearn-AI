# SmartLearn AI

<p align="left">
  <img alt="GitHub Release" src="https://img.shields.io/badge/Release-v13.7.4(Beta)-red?style=flat-square">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11%2B-blue?style=flat-square&logo=python">
  <img alt="React" src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=flat-square">
</p>

SmartLearn AI is a next-generation cognitive architecture and educational assistant. Built from the ground up to deliver uncompromising speed, reliability, and intelligence, the platform seamlessly integrates a sophisticated Retrieval-Augmented Generation (RAG) pipeline with real-time multi-modal AI capabilities.

## Enterprise-Grade Architecture

SmartLearn AI transcends traditional chatbot interfaces by offering a suite of industry-level tools designed for deep analytical research and interactive learning.

### Core Capabilities

- **Zero-Latency Live Code Execution:** An integrated browser-based IDE powered by Sandpack. Users can write, execute, edit, and hot-reload React and JavaScript applications directly inside the chat interface without external dependencies.
- **Autonomous Web Browsing (Playwright):** SmartLearn launches a headless Chromium browser in the background to navigate URLs, wait for page renders, scrape content, and snap live viewport screenshots directly into the chat stream.
- **Zero-Retention Private Mode:** A strict, SOC2-compliant hardware-level privacy feature that bypasses the database completely. Conversations live exclusively in RAM and are permanently destroyed upon closing the session.
- **Multimodal Vision Engine:** Features a highly optimized client-side compression algorithm that processes high-resolution images instantly, routing complex visual data directly to specialized native models (e.g., Gemini 2.5 Flash) while completely avoiding backend token bloat.
- **Advanced Fallback Architecture:** Engineered for 100% uptime. The proprietary router dynamically cascades queries across elite foundational models (including Groq LLaMA 3.3, Google Gemini, and OpenRouter variants). If a provider encounters a rate limit or network timeout, the system seamlessly redirects the stream without interrupting the user experience.
- **AI Personalization Engine:** A comprehensive configuration suite allowing users to define strict custom instructions, assign professional archetypes (e.g., 'Socratic Tutor', 'Code Ninja'), and dictate AI behavioral tones. These personas are dynamically injected at the backend router level for zero-latency adherence.
- **Cross-Tab State Synchronization:** An auto-recovery system engineered into the React frontend. It silently fetches from the database the moment a stream finishes or disconnects, instantly healing the UI state across multiple browser tabs without infinite loading spinners.
- **Interactive 3D Flashcards:** Features a mathematically robust parsing engine that sanitizes LLM-hallucinated markdown blocks, rendering study materials into pure CSS 3D perspective glassmorphic flashcards.
- **Visual Knowledge Architecture:** Automatically extracts complex relationships from uploaded documents and plots them into a living, interactive node graph utilizing React Flow.
- **Premium Data Tables & Structural Rendering:** Engineered custom Markdown processing to produce OLED-style glassmorphic tables with intelligent regex-based colored pill badges for analytical metrics. Native KaTeX integration ensures textbook-quality formatting for advanced calculus and physics equations.
- **Dynamic UI Mechanics:** Features an intelligent auto-scroll locking algorithm that detects manual scroll velocity to gracefully detach during live streams, paired with sleek, morphing control buttons to mirror top-tier production environments.
- **Advanced Voice Mode Engine:** A hyper-realistic, hands-free conversational interface featuring a full-screen dynamic glowing orb. Built with auto-listen mechanics, phase-state orchestration (Listening, Processing, Speaking), and aggressive Whisper audio filters to neutralize background noise hallucinations.
- **Perplexity-Style Web Search:** Deep integration with the Tavily API for real-time web extraction. Results are presented in an interactive horizontal carousel of source cards—complete with favicons and site metadata—persistently saved to PostgreSQL.
- **Enterprise SMTP & Authentication:** A completely overhauled automated email engine featuring official SmartLearn Red branding, dynamic logo injection, and glassmorphic OTP verification boxes, ensuring maximum security during password resets and account purging.

## Technical Stack

The infrastructure is meticulously separated into a high-performance Python backend and a lightning-fast React frontend.

<p align="left">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi">
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img alt="Redis" src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white">
</p>

### Frontend 
- React 19 (Vite)
- TailwindCSS (Utility-first styling with custom glassmorphism)
- Framer Motion (Fluid 60fps animations and state transitions)
- CodeSandbox Sandpack (Live execution engine)
- React Flow (Interactive node graphs)

### Backend
- FastAPI (High-throughput asynchronous routing)
- SQLAlchemy & PostgreSQL (Persistent, encrypted data storage)
- FAISS & Sentence Transformers (In-memory semantic vector search)
- Upstash Redis (Global edge caching for sub-millisecond retrieval)
- Dynamic Model Routing (Groq, Gemini, OpenRouter)

## Architecture Flow

The following diagram illustrates the high-level data flow and component interaction within the SmartLearn AI ecosystem:

```mermaid
graph TD
    User("User Client / Browser")
    Vite("React Frontend UI")
    FastAPI("FastAPI Backend Server")
    FAISS[("FAISS Vector DB")]
    Postgres[("PostgreSQL")]
    Redis[("Upstash Redis Cache")]
    Router{"AI Model Router"}
    Groq("Groq LLaMA 3.3")
    Gemini("Google Gemini 2.5")
    OpenRouter("OpenRouter Fallbacks")

    User <-->|"WebSocket / SSE"| Vite
    Vite <-->|"REST API"| FastAPI
    FastAPI <-->|"Embeddings Retrieval"| FAISS
    FastAPI <-->|"Session / Chat History"| Postgres
    FastAPI <-->|"Global Edge Caching"| Redis
    FastAPI -->|"Prompt & Context"| Router
    Router -->|"Primary Text"| Groq
    Router -->|"Multimodal / Vision"| Gemini
    Router -.->|"Fallback Routing"| OpenRouter

    classDef client fill:#0a0a0a,stroke:#38B2AC,stroke-width:2px,color:#fff
    classDef api fill:#005571,stroke:#fff,stroke-width:2px,color:#fff
    classDef db fill:#316192,stroke:#fff,stroke-width:2px,color:#fff
    classDef ai fill:#DC382D,stroke:#fff,stroke-width:2px,color:#fff

    class User,Vite client;
    class FastAPI api;
    class FAISS,Postgres,Redis db;
    class Router,Groq,Gemini,OpenRouter ai;
```

## Security & Privacy

SmartLearn AI operates on a strict Zero-Knowledge architecture paradigm. User documents, custom instructions, and chat histories are completely siloed and encrypted at rest. Proprietary data is never utilized to train public foundational AI models. Furthermore, an integrated Global Privacy Mode allows users to instantly obscure all historical chat data during screen-sharing or collaborative sessions.

## Development Setup

### 1. Repository Initialization
```bash
git clone https://github.com/YOUR_USERNAME/smartlearn.git
cd smartlearn
```

### 2. Backend Environment
```bash
cd smartlearn-backend
pip install -r requirements.txt
```

### Environment Configuration

SmartLearn AI requires a `.env` file situated in the `smartlearn-backend/` root directory. The system utilizes an intelligent fallback router, meaning you only need to provide API keys for the foundational models you intend to use. 

Create a `.env` file using the following industry-standard template:

<details>
<summary><b>Click to expand Environment Variable Template</b></summary>

```env
# ────────────────────────────────────────────────────
# CORE INFRASTRUCTURE & AUTHENTICATION
# ────────────────────────────────────────────────────
# Allowed origins for CORS (Set to your Vercel URL in production)
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# URL used to dynamically route emails back to your React app
FRONTEND_URL="http://localhost:5173"

# Secret key for encrypting JWT tokens and session data
JWT_SECRET="your_jwt_secret_here"

# The public connection string to your PostgreSQL instance
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Upstash Redis for global edge caching and session state management
REDIS_URL="rediss://default:password@host:port"

# ────────────────────────────────────────────────────
# EMAIL SERVER FOR OTP & ACCOUNT DELETION
# ────────────────────────────────────────────────────
SMTP_EMAIL="your_email@gmail.com"
SMTP_PASSWORD="your_app_specific_password_here"

# ────────────────────────────────────────────────────
# AI MODEL PROVIDERS & EXTERNAL INTEGRATIONS
# ────────────────────────────────────────────────────
# Groq (Powers LLaMA 3.3 for ultra-low latency text generation)
GROQ_API_KEY="gsk_..."

# Google Gemini (Powers Gemini 2.5 Flash for multimodal vision tasks)
GEMINI_API_KEY="AQ..."

# OpenRouter (The primary fallback safety net to guarantee 100% uptime)
OPENROUTER_API_KEY="sk-or-v1-..."

# Tavily API for enterprise-grade live web extraction and scraping
TAVILY_API_KEY="tvly-..."

# YouTube API for extracting transcripts and analyzing video data
YOUTUBE_API_KEY="AIza..."
```
</details>

Start the asynchronous server:
```bash
uvicorn main:app --reload
```
The backend initializes on `http://127.0.0.1:8000`.

### 3. Frontend Environment
```bash
cd smartlearn-frontend
npm install
```

To ensure the frontend correctly routes API traffic to the backend, create a `.env` file in the `smartlearn-frontend/` directory:
```env
# ────────────────────────────────────────────────────
# VITE API CONFIGURATION (VERCEL DEPLOYMENT)
# ────────────────────────────────────────────────────
# Local dev: http://localhost:8000
# Production: Your Railway Backend URL (e.g. https://smartlearn.up.railway.app)
VITE_API_URL=http://localhost:8000
```

Start the Vite development server:
```bash
npm run dev
```
The frontend initializes on `http://localhost:5173`.

## Leadership & Engineering

- **Sanan Malik** – CEO & Visionary
- **Naveed Ahmed** – Lead Architect & Developer

---

## Contributing

We welcome contributions from the open-source community. If you would like to contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please ensure all PRs pass internal linting and maintain the zero-latency architectural standards established by the core team.

## License

Distributed under the MIT License. See `LICENSE` for more information.