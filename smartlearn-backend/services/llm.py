import os
import time
from groq import Groq
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# FIXED: Use only fast models on Railway free tier
# llama-3.3-70b is huge and slow on free plans — moved to last resort only
MODELS = [
    "llama-3.1-8b-instant",    # fastest — use first always
    "llama-3.2-11b-text-preview",  # medium fallback
    "mixtral-8x7b-32768",      # last resort
]

SYSTEM_PROMPT = """You are SmartLearn AI — a friendly, smart learning assistant.

- Use emojis naturally 🎓 but keep responses focused
- Use **bold** for key terms, code blocks for code
- Use tables for comparisons, numbered lists for steps
- Keep paragraphs short (3-4 lines max)
- End complex answers with a "💡 Quick Recap"
- Be warm and encouraging — like a smart friend, not a textbook"""


# ────────────────────────────────────────────────────
# STREAMING  (primary — used by /chat endpoint)
# ────────────────────────────────────────────────────
def stream_llm_response(prompt: str) -> Generator[str, None, None]:
    """
    Yields tokens one by one from Groq streaming API.
    Falls back to next model on failure.
    """
    last_error = None

    for model in MODELS:
        try:
            stream = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1024,   # FIXED: was 2048 — halved for speed on free tier
                top_p=0.9,
                stream=True,
            )

            for chunk in stream:
                token = chunk.choices[0].delta.content
                if token:
                    yield token
            return  # success

        except Exception as e:
            last_error = e
            err_str = str(e).lower()

            if "rate_limit" in err_str or "429" in err_str:
                yield "\n\n⚠️ Rate limit hit. Please wait a moment and try again."
                return

            # Model unavailable → try next
            continue

    yield f"\n\n⚠️ All models unavailable. Please try again. (Error: {last_error})"


# ────────────────────────────────────────────────────
# NON-STREAMING  (fallback, kept for compatibility)
# ────────────────────────────────────────────────────
def get_llm_response(prompt: str, retries: int = 2) -> str:
    last_error = None

    for model in MODELS:
        for attempt in range(retries):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user",   "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1024,
                    top_p=0.9,
                )
                return response.choices[0].message.content

            except Exception as e:
                last_error = e
                err_str = str(e).lower()

                if "rate_limit" in err_str or "429" in err_str:
                    time.sleep((attempt + 1) * 2)
                    continue

                if "model" in err_str or "unavailable" in err_str:
                    break

                time.sleep(1)

    return f"⚠️ SmartLearn AI is temporarily unavailable. (Error: {last_error})"