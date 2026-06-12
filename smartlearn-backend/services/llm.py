import os
from typing import Generator, List, Dict
from openai import OpenAI
from groq import Groq
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

# OpenRouter Client (with timeout)
openrouter_client = None
if os.getenv("OPENROUTER_API_KEY") or os.getenv("GROQ_API_KEY"):
    openrouter_client = OpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY", os.getenv("GROQ_API_KEY")),
        base_url="https://openrouter.ai/api/v1",
        timeout=15.0
    )

# Groq Official Client (with timeout)
groq_client = None
if os.getenv("GROQ_API_KEY"):
    groq_client = Groq(
        api_key=os.getenv("GROQ_API_KEY"),
        timeout=15.0
    )

# Gemini Official Client (OpenAI Compatible)
gemini_client = None
if os.getenv("GEMINI_API_KEY"):
    gemini_client = OpenAI(
        api_key=os.getenv("GEMINI_API_KEY"),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        timeout=15.0
    )

tavily_client = None
if os.getenv("TAVILY_API_KEY"):
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

DEFAULT_MODEL = "groq:llama-3.1-8b-instant"

# Advanced Fallback Architecture
FALLBACK_ROUTER = {
    # The "SmartLearn Auto" Route (The Ultimate Fallback Safety Net)
    "openrouter/auto": [
        "gemini:gemini-2.5-flash", 
        "groq:llama-3.3-70b-versatile",
        "openrouter/deepseek/deepseek-r1-distill-llama-70b:free",
        "openrouter/google/gemini-2.5-flash-free",
        "groq:llama-3.1-8b-instant",
        "openrouter/meta-llama/llama-3.3-70b-instruct:free",
        "openrouter/qwen/qwen-2.5-72b-instruct:free"
    ],

    # Kept for backward compatibility if old chats use this model
    "openai/gpt-4o": ["openai/gpt-4o-mini", "groq:llama-3.1-8b-instant", "openrouter/auto"]
}

SYSTEM_PROMPT = """You are SmartLearn AI — an advanced, highly intelligent learning assistant and professional tutor.

- **Provide extremely comprehensive, detailed, and profound explanations.**
- Act like an advanced system (e.g. ChatGPT, Claude) that deeply explores concepts.
- Use rich formatting: **bolding**, extensive `code blocks`, `inline code`, clear ## Headings, and Markdown tables to structure complex data.
- **Math:** ALWAYS use `$$` for block math equations (e.g. `$$x^2$$`) and `$` for inline math (e.g. `$y=mx+b$`).
- **Mind Maps:** If the user asks for a mind map, you MUST output a code block with the language `mindmap`. The content must be valid JSON with `nodes` (id, label) and `edges` (source, target). Example:
```mindmap
{"nodes":[{"id":"1","label":"Root"}],"edges":[]}
```
- Never give overly brief or short answers unless explicitly asked. Always strive for maximum educational value and depth.
- End complex answers with a "💡 **Executive Summary**" or "💡 **Quick Recap**".
- Be professional, highly capable, and encouraging.

About SmartLearn AI:
- You were created by the SmartLearn Team
- CEO / Leader: Sanan Malik
- Lead Developer: Naveed Ahmed
- You are NOT made by OpenAI, Anthropic, Google, or any other company
- Never say you are ChatGPT, Claude, Gemini, or any other AI

### INTERACTIVE TOOLS (STRICT RULES)
You have the power to instantly render highly interactive UI components by outputting specific Markdown code blocks. 
CRITICAL RULE: NEVER, EVER generate a quiz, flashcard deck, or mind map UNLESS the user explicitly uses the words "quiz", "flashcard", "mind map", or directly asks you to generate one. If they just ask a normal question (e.g., "What is photosynthesis?"), just give a normal text response. Do NOT show off your tools unprompted!

**1. Interactive Quiz**
If the user explicitly asks for a quiz, output a markdown code block with the language `quiz`. Inside it, provide a valid JSON array of questions:
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
If the user explicitly asks for flashcards, output a markdown code block with the language `flashcard`. Inside it, provide a valid JSON array of front/back pairs:
```flashcard
[
  {
    "front": "Capital of France?",
    "back": "Paris"
  }
]
```

**3. Mind Maps & Flowcharts**
If the user explicitly asks for a mind map, flowchart, or diagram, output a markdown code block with the language `mermaid`. Inside it, use valid Mermaid.js syntax:
```mermaid
graph TD
  A[Concept] --> B[Detail 1]
  A --> C[Detail 2]
```"""

# ────────────────────────────────────────────────────
# TAVILY WEB SEARCH
# ────────────────────────────────────────────────────
def search_tavily(query: str):
    """Uses Tavily API to fetch clean markdown web context for a given query, returning (context_str, urls_list)."""
    if not tavily_client:
        return "", []
    try:
        response = tavily_client.search(query=query, search_depth="advanced", max_results=6)
        results = response.get('results', [])
        
        formatted_results = []
        urls = []
        for r in results:
            content = r.get('content', '')
            url = r.get('url', '')
            if content:
                formatted_results.append(f"- **Source** ({url}):\n{content}")
                if url and url not in urls:
                    urls.append(url)
                
        return "\n\n".join(formatted_results), urls
    except Exception as e:
        print(f"Tavily search failed: {e}")
        return "", []

def get_optimal_search_query(message: str, history: List[Dict] = None, force: bool = False) -> str:
    """
    Determines if a web search is needed. If YES (or forced), generates the optimal Google search query.
    If NO, returns 'NO_SEARCH'.
    """
    import datetime
    current_year = datetime.datetime.now().year
    
    if force:
        sys_prompt = "You are an expert Google Search Query generator. Based on the user's latest message and conversation history, output ONLY the optimal 2-6 word search query to find the answer. Do not include quotes."
    else:
        sys_prompt = f"""You are a Web Search Routing Agent. Current year: {current_year}.
Determine if the user's latest message requires a live web search.
You MUST search the web if the prompt:
1. Asks about recent news, current events, weather, sports, or stock prices.
2. Asks about years {current_year} or later (e.g., '2026', '{current_year}').
3. Uses phrases like 'search', 'latest', 'today', 'current'.
4. Asks for highly specific technical documentation or obscure facts.

If a search IS needed, output ONLY the optimal 2-6 word Google search query. Do not use quotes.
If NO search is needed, output EXACTLY 'NO_SEARCH'."""

    try:
        query = get_llm_response(message, model_id="groq:llama-3.1-8b-instant", system_prompt=sys_prompt, history=history)
        query = query.strip().strip('"').strip("'")
        
        if not force and ("NO_SEARCH" in query.upper() or len(query) > 50):
            return "NO_SEARCH"
            
        return query
    except Exception as e:
        print(f"Query generation failed: {e}")
        return message if force else "NO_SEARCH"

# ────────────────────────────────────────────────────
# STREAMING  (primary — used by /chat endpoint)
# ────────────────────────────────────────────────────
def stream_llm_response(prompt: str, model_id: str = DEFAULT_MODEL, history: List[Dict] = None) -> Generator[str, None, None]:
    """
    Yields tokens one by one with multi-turn conversation memory and advanced cascading model fallback.
    """
    model_chain = [model_id] + FALLBACK_ROUTER.get(model_id, [])

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        messages.extend(history[-10:])  # Bound history to last 10 messages to prevent token overflow
    messages.append({"role": "user", "content": prompt})

    for current_model in model_chain:
        tokens_yielded = False
        try:
            if current_model.startswith("groq:"):
                if not groq_client:
                    raise Exception("Groq API key not configured")
                active_client = groq_client
                actual_model = current_model.replace("groq:", "")
                extra_args = {}
            elif current_model.startswith("gemini:"):
                if not gemini_client:
                    raise Exception("Gemini API key not configured")
                active_client = gemini_client
                actual_model = current_model.replace("gemini:", "")
                extra_args = {}
            else:
                if not openrouter_client:
                    raise Exception("OpenRouter API key not configured")
                active_client = openrouter_client
                actual_model = current_model
                extra_args = {
                    "extra_body": {
                        "route": "fallback",
                        "provider": {"sort": "throughput"}
                    }
                }

            stream = active_client.chat.completions.create(
                model=actual_model,
                messages=messages,
                temperature=0.7,
                max_tokens=4096,
                top_p=0.9,
                stream=True,
                **extra_args
            )

            # If we've fallen back to a backup model, let the user know gracefully
            if current_model != model_id:
                yield f"> ⚠️ **Notice:** Switched to fallback model `{current_model}` due to high traffic or API limits on the primary model.\n\n"

            for chunk in stream:
                if chunk.choices and len(chunk.choices) > 0:
                    token = chunk.choices[0].delta.content
                    if token:
                        tokens_yielded = True
                        yield token
            
            # Successfully finished streaming, break out of fallback loop
            return

        except Exception as e:
            err_str = str(e).lower()
            
            # Prevent mid-stream UI corruption if connection drops while typing
            if tokens_yielded:
                yield f"\n\n> ⚠️ **Network Disconnect:** The AI stream was interrupted mid-sentence. Please try asking again. (Error: {e})"
                return
            # If this is the LAST model in our fallback chain, we must yield the error to the user
            if current_model == model_chain[-1]:
                if "rate_limit" in err_str or "429" in err_str:
                    yield f"\n\n⚠️ Rate limit hit on all {len(model_chain)} models in the cascade. Please wait 30 seconds and try again."
                elif "insufficient" in err_str or "credits" in err_str:
                    yield "\n\n⚠️ Your OpenRouter account ran out of credits, and no free fallbacks were available."
                else:
                    yield f"\n\n⚠️ Models unavailable. (Final Error: {e})"
                return
            else:
                # Log the error and continue to the next fallback model in the loop
                print(f"Model {current_model} failed: {e}. Cascading to fallback...")
                continue

# ────────────────────────────────────────────────────
# NON-STREAMING  (fallback, kept for compatibility)
# ────────────────────────────────────────────────────
def get_llm_response(prompt: str, model_id: str = DEFAULT_MODEL, history: List[Dict] = None, system_prompt: str = SYSTEM_PROMPT) -> str:
    model_chain = [model_id] + FALLBACK_ROUTER.get(model_id, [])

    messages = [{"role": "system", "content": system_prompt}] if system_prompt else []
    if history:
        messages.extend(history[-10:])  # Bound history to prevent token overflow
    messages.append({"role": "user", "content": prompt})

    for current_model in model_chain:
        try:
            if current_model.startswith("groq:"):
                if not groq_client:
                    raise Exception("Groq API key not configured")
                active_client = groq_client
                actual_model = current_model.replace("groq:", "")
                extra_args = {}
            elif current_model.startswith("gemini:"):
                if not gemini_client:
                    raise Exception("Gemini API key not configured")
                active_client = gemini_client
                actual_model = current_model.replace("gemini:", "")
                extra_args = {}
            else:
                if not openrouter_client:
                    raise Exception("OpenRouter API key not configured")
                active_client = openrouter_client
                actual_model = current_model
                extra_args = {
                    "extra_body": {
                        "route": "fallback",
                        "provider": {"sort": "throughput"}
                    }
                }

            response = active_client.chat.completions.create(
                model=actual_model,
                messages=messages,
                temperature=0.7,
                max_tokens=4096,
                top_p=0.9,
                **extra_args
            )
            return response.choices[0].message.content
        except Exception as e:
            if current_model == model_chain[-1]:
                return f"⚠️ SmartLearn AI and its fallbacks are temporarily unavailable. (Error: {e})"
            else:
                print(f"Model {current_model} failed: {e}. Cascading to fallback...")
                continue

# ────────────────────────────────────────────────────
# TITLE GENERATION
# ────────────────────────────────────────────────────
def generate_chat_title(message: str) -> str:
    """Generates a short 3-5 word title using the fallback system."""
    prompt = f"Generate a short, concise, 3 to 5 word title for the following message. Return ONLY the title text, nothing else, no quotes, no explanation:\n\n{message}"
    
    try:
        title = get_llm_response(prompt, model_id="groq:llama-3.1-8b-instant", system_prompt="")
        title = title.strip().strip('"').strip("'")
        return title if title else message[:30]
    except Exception:
        return message[:30]