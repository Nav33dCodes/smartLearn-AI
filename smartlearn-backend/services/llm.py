import os
import time
from openai import OpenAI
from dotenv import load_dotenv
from typing import Generator
from tavily import TavilyClient

load_dotenv()

# OpenRouter is 100% compatible with the official OpenAI SDK
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY", os.getenv("GROQ_API_KEY")), # Fallback to GROQ_API_KEY if testing
    base_url="https://openrouter.ai/api/v1"
)

tavily_client = None
if os.getenv("TAVILY_API_KEY"):
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

DEFAULT_MODEL = "meta-llama/llama-3-8b-instruct:free"

SYSTEM_PROMPT = """You are SmartLearn AI — a friendly, smart learning assistant.

- Use emojis naturally 🎓 but keep responses focused
- Use **bold** for key terms, code blocks for code
- Use tables for comparisons, numbered lists for steps
- Keep paragraphs short (3-4 lines max)
- End complex answers with a "💡 Quick Recap"
- Be warm and encouraging — like a smart friend, not a textbook

About SmartLearn AI:
- You were created by the SmartLearn Team
- CEO / Leader: Sanan Malik
- Developers: Naveed Ahmed, Dua Fatima, Zeshan Sikandar, Shayan Umer, Fiza Imran
- You are NOT made by OpenAI, Anthropic, Google, or any other company
- If anyone asks who made you, who your team is, or who the CEO is — answer from the info above only
- Never say you are ChatGPT, Claude, Gemini, or any other AI"""

# ────────────────────────────────────────────────────
# TAVILY WEB SEARCH
# ────────────────────────────────────────────────────
def search_tavily(query: str) -> str:
    """Uses Tavily API to fetch clean markdown web context for a given query."""
    if not tavily_client:
        return ""
    try:
        response = tavily_client.search(query=query, search_depth="basic", max_results=3)
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
        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
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
    Yields tokens one by one from OpenRouter streaming API.
    """
    try:
        stream = client.chat.completions.create(
            model=model_id,
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
        response = client.chat.completions.create(
            model=model_id,
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
        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
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