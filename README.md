# SmartLearn AI

SmartLearn AI is a next-generation cognitive architecture and educational assistant. Built from the ground up to deliver uncompromising speed, reliability, and intelligence, the platform seamlessly integrates a sophisticated Retrieval-Augmented Generation (RAG) pipeline with real-time multi-modal AI capabilities.

## Enterprise-Grade Architecture

SmartLearn AI transcends traditional chatbot interfaces by offering a suite of industry-level tools designed for deep analytical research and interactive learning.

### Core Capabilities

- **Zero-Latency Live Code Execution:** An integrated browser-based IDE powered by Sandpack. Users can write, execute, edit, and hot-reload React and JavaScript applications directly inside the chat interface without external dependencies.
- **Multimodal Vision Engine:** Features a highly optimized client-side compression algorithm that processes high-resolution images instantly, routing complex visual data directly to specialized native models (e.g., Gemini 2.5 Flash) while completely avoiding backend token bloat.
- **Advanced Fallback Architecture:** Engineered for 100% uptime. The proprietary router dynamically cascades queries across elite foundational models (including Groq LLaMA 3.3, Google Gemini, and OpenRouter variants). If a provider encounters a rate limit or network timeout, the system seamlessly redirects the stream without interrupting the user experience.
- **AI Personalization Engine:** A comprehensive configuration suite allowing users to define strict custom instructions, assign professional archetypes (e.g., 'Socratic Tutor', 'Code Ninja'), and dictate AI behavioral tones. These personas are dynamically injected at the backend router level for zero-latency adherence.
- **Direct Web Extraction:** Capable of bypassing basic search engine snippets. The system leverages enterprise-grade extraction APIs (Tavily) to pierce through anti-bot firewalls, downloading and injecting raw website content directly into the active RAG memory.
- **Visual Knowledge Architecture:** Automatically extracts complex relationships from uploaded documents and plots them into a living, interactive node graph utilizing React Flow.
- **Mathematical & Structural Rendering:** Native KaTeX integration ensures textbook-quality formatting for advanced calculus, physics equations, and data tables.

## Technical Stack

The infrastructure is meticulously separated into a high-performance Python backend and a lightning-fast React frontend.

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

Create a `.env` file in the backend directory containing your requisite API keys (e.g., `GROQ_API_KEY`, `DATABASE_URL`, `TAVILY_API_KEY`, `REDIS_URL`).

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

Start the Vite development server:
```bash
npm run dev
```
The frontend initializes on `http://localhost:5173`.

## Architecture Flow

1. Data Ingestion: Documents (PDF, DOCX, TXT) are uploaded and sanitized.
2. Vectorization: Text is chunked and embedded via Sentence Transformers, then indexed in FAISS.
3. Query Routing: User prompts are evaluated for required context (Web Search vs. Vector Retrieval).
4. Prompt Construction: Persona settings, historical context, and RAG data are compiled into a strict system prompt.
5. Inference: The query is routed to the optimal AI model via the Fallback Router.
6. Streaming: The response is streamed asynchronously back to the client and cached globally.

## The Team

- Sanan Malik (CEO & Visionary)
- Naveed Ahmed (Lead Architect & Developer)
- Dua Fatima (Developer)
- Zeshan Sikandar (Developer)
- Shayan Umer (Developer)
- Fiza Imran (Developer)