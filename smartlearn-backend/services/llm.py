import os
import time
from groq import Groq
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Model priority list (fast → powerful fallback) ──
MODELS = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
]

SYSTEM_PROMPT = """You are SmartLearn AI — a friendly, smart, and engaging learning assistant.

Your personality:
- Warm, encouraging, and motivating 🎓
- Use emojis naturally to make responses lively (don't overdo it)
- Celebrate curiosity: treat every question as a great one
- Be concise but thorough — no unnecessary filler

Your capabilities:
- Explain complex topics simply with real-world analogies
- Generate helpful examples, code snippets, and step-by-step breakdowns
- Create ASCII charts/diagrams when visualizing data helps understanding
- Use markdown formatting: headers, bold, bullet points, tables, code blocks
- Add motivational touches when a student seems stuck or confused

Formatting rules:
- Use **bold** for key terms
- Use ``` code blocks ``` for any code
- Use tables for comparisons
- Use numbered lists for steps
- Keep paragraphs short (3-4 lines max)
- End complex explanations with a "💡 Quick Recap" summary

Tone: Smart best friend who happens to know everything — not a robot, not a textbook."""


# ────────────────────────────────────────────────────
# NON-STREAMING  (kept for internal/fallback use)
# ────────────────────────────────────────────────────
def get_llm_response(prompt: str, retries: int = 2) -> str:
    """
    Call Groq API with automatic retry and model fallback.
    Returns the full response string.
    """
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
                    temperature=0.72,
                    max_tokens=2048,
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

    return f"⚠️ SmartLearn AI is temporarily unavailable. Please try again. (Error: {last_error})"


# ────────────────────────────────────────────────────
# STREAMING  (token by token from Groq)
# ────────────────────────────────────────────────────
def stream_llm_response(prompt: str) -> Generator[str, None, None]:
    """
    Generator that yields tokens one by one as they arrive from Groq.
    Automatically falls back to the next model if one is unavailable.
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
                temperature=0.72,
                max_tokens=2048,
                top_p=0.9,
                stream=True,  # 👈 enables true streaming
            )

            for chunk in stream:
                token = chunk.choices[0].delta.content
                if token:
                    yield token

            return  # success — done, stop trying other models

        except Exception as e:
            last_error = e
            err_str = str(e).lower()

            # Rate limit — inform user and stop
            if "rate_limit" in err_str or "429" in err_str:
                yield "\n\n⚠️ Rate limit reached. Please wait a moment and try again."
                return

            # Model unavailable — silently try next model
            continue

    # All models failed
    yield f"\n\n⚠️ SmartLearn AI is temporarily unavailable. (Error: {last_error})"