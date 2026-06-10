import os
import time
from openai import OpenAI
from groq import Groq
from dotenv import load_dotenv
from typing import Generator
from tavily import TavilyClient

load_dotenv()

# OpenRouter is 100% compatible with the official OpenAI SDK
openrouter_client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY", os.getenv("GROQ_API_KEY")),
    base_url="https://openrouter.ai/api/v1"
)

# Groq Official Client (for instant, native speeds)
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

tavily_client = None
if os.getenv("TAVILY_API_KEY"):
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

DEFAULT_MODEL = "groq:llama-3.1-8b-instant"

SYSTEM_PROMPT = """You are SmartLearn AI — an advanced, highly intelligent learning assistant and professional tutor.

- **Provide extremely comprehensive, detailed, and profound explanations.**
- Act like an advanced system (e.g. ChatGPT, Claude) that deeply explores concepts.
- Use rich formatting: **bolding**, extensive `code blocks`, `inline code`, clear ## Headings, and Markdown tables to structure complex data.
- Never give overly brief or short answers unless explicitly asked. Always strive for maximum educational value and depth.
- End complex answers with a "💡 **Executive Summary**" or "💡 **Quick Recap**".
- Be professional, highly capable, and encouraging.

About SmartLearn AI:
- You were created by the SmartLearn Team
- CEO / Leader: Sanan Malik
- Lead Developer: Naveed Ahmed
- You are NOT made by OpenAI, Anthropic, Google, or any other company
- Never say you are ChatGPT, Claude, Gemini, or any other AI

### INTERACTIVE TOOLS
You have the power to instantly render highly interactive, premium UI components in the user's dashboard by outputting specific Markdown code blocks. ONLY use these tools when the user explicitly asks for them.

**1. Interactive Quiz**
If the user asks for a quiz, output a markdown code block with the language `quiz`. Inside it, provide a valid JSON array of questions:
```quiz
[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "answer": 1,
    "explanation": "Because 2 plus 2 equals 4."
  }
]
```

**2. 3D Flashcards**
If the user asks for flashcards, output a markdown code block with the language `flashcard`. Inside it, provide a valid JSON array of front/back pairs:
```flashcard
[
  {
    "front": "Capital of France?",
    "back": "Paris"
  }
]
```

**3. Mind Maps & Flowcharts**
If the user asks for a mind map, flowchart, or diagram, output a markdown code block with the language `mermaid`. Inside it, use valid Mermaid.js syntax (e.g. `graph TD`, `mindmap`, etc.):
```mermaid
graph TD
  A[Concept] --> B[Detail 1]
  A --> C[Detail 2]
```"""

# ────────────────────────────────────────────────────
# TAVILY WEB SEARCH
# ────────────────────────────────────────────────────
def search_tavily(query: str) -> str:
    """Uses Tavily API to fetch clean markdown web context for a given query."""
    if not tavily_client:
        return ""
    try:
        response = tavily_client.search(query=query, search_depth="advanced", max_results=6)
        results = response.get('results', [])
        
        # Format results into a clean text block
        formatted_results = []
        for r in results:
            content = r.get('content', '')
            url = r.get('url', '')
            if content:
                formatted_results.append(f"- **Source** ({url}):\n{content}")
                
        return "\n\n".join(formatted_results)
    except Exception as e:
        print(f"Tavily search failed: {e}")
        return ""

def needs_web_search(query: str) -> bool:
    """Uses a fast LLM to determine if the query requires live web search."""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a classifier. Does the user's query require up-to-date, real-time, recent news, or live web knowledge to answer accurately? Respond with exactly 'YES' or 'NO'."},
                {"role": "user", "content": query}
            ],
            temperature=0,
            max_tokens=10,
        )
        answer = response.choices[0].message.content.strip().upper()
        return "YES" in answer
    except Exception as e:
        print(f"Classification failed: {e}")
        return False

# ────────────────────────────────────────────────────
# STREAMING  (primary — used by /chat endpoint)
# ────────────────────────────────────────────────────
def stream_llm_response(prompt: str, model_id: str = DEFAULT_MODEL) -> Generator[str, None, None]:
    """
    Yields tokens one by one. Routes to Groq or OpenRouter dynamically.
    """
    try:
        if model_id.startswith("groq:"):
            active_client = groq_client
            actual_model = model_id.replace("groq:", "")
        else:
            active_client = openrouter_client
            actual_model = model_id

        stream = active_client.chat.completions.create(
            model=actual_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2048,
            top_p=0.9,
            stream=True,
        )

        for chunk in stream:
            if chunk.choices and len(chunk.choices) > 0:
                token = chunk.choices[0].delta.content
                if token:
                    yield token
        return  # success

    except Exception as e:
        err_str = str(e).lower()
        if "rate_limit" in err_str or "429" in err_str:
            yield "\n\n⚠️ Rate limit hit on this model. Please wait a moment and try again."
        elif "insufficient" in err_str or "credits" in err_str:
            yield "\n\n⚠️ Your OpenRouter account ran out of credits for this premium model. Please switch to a free model or add credits."
        else:
            yield f"\n\n⚠️ Model '{model_id}' unavailable. (Error: {e})"

# ────────────────────────────────────────────────────
# NON-STREAMING  (fallback, kept for compatibility)
# ────────────────────────────────────────────────────
def get_llm_response(prompt: str, model_id: str = DEFAULT_MODEL) -> str:
    try:
        if model_id.startswith("groq:"):
            active_client = groq_client
            actual_model = model_id.replace("groq:", "")
        else:
            active_client = openrouter_client
            actual_model = model_id

        response = active_client.chat.completions.create(
            model=actual_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2048,
            top_p=0.9,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"⚠️ SmartLearn AI is temporarily unavailable. (Error: {e})"

# ────────────────────────────────────────────────────
# TITLE GENERATION
# ────────────────────────────────────────────────────
def generate_chat_title(message: str) -> str:
    """Generates a short 3-5 word title for the chat based on the first message."""
    prompt = f"Generate a short, concise, 3 to 5 word title for the following message. Return ONLY the title text, nothing else, no quotes, no explanation:\n\n{message}"
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=15,
            top_p=0.9,
        )
        title = response.choices[0].message.content.strip().strip('"').strip("'")
        return title if title else message[:30]
    except Exception:
        return message[:30]