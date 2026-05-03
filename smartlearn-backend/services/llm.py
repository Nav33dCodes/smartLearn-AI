import os
import time
from groq import Groq
from dotenv import load_dotenv

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


def get_llm_response(prompt: str, retries: int = 2) -> str:
    """
    Call Groq API with automatic retry and model fallback.
    Returns the response string or an error message.
    """
    last_error = None

    for model in MODELS:
        for attempt in range(retries):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.72,
                    max_tokens=2048,
                    top_p=0.9,
                )
                return response.choices[0].message.content

            except Exception as e:
                last_error = e
                err_str = str(e).lower()

                # Rate limit → wait then retry
                if "rate_limit" in err_str or "429" in err_str:
                    wait = (attempt + 1) * 2
                    time.sleep(wait)
                    continue

                # Model unavailable → try next model immediately
                if "model" in err_str or "unavailable" in err_str:
                    break

                # Other error → short wait then retry
                time.sleep(1)

    return f"⚠️ SmartLearn AI is temporarily unavailable. Please try again in a moment. (Error: {last_error})"