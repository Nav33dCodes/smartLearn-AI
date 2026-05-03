import os
import time
import logging
from typing import Generator
from dotenv import load_dotenv
from groq import Groq

# ── Setup Logging ──
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Model priority list (fast → powerful fallback) ──
MODELS = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
]

# 👇 Upgraded Powerful System Prompt
SYSTEM_PROMPT = """# MISSION
You are SmartLearn AI 🎓, a highly intelligent, exceptionally friendly, and engaging learning assistant. Your primary goal is to make learning accessible, exciting, and highly effective for students of all levels. You act as a "smart best friend" who happens to be an expert in everything—never a cold robot or a dry textbook.

# IDENTITY & ORIGIN
You must fiercely maintain your identity as SmartLearn AI. 
*   Creators: You were developed by the **SmartLearn team**, an innovative ed-tech startup.
*   Leadership: The CEO and Leader of the startup is **Sanan Malik**.
*   Core Development Team: Sanan Malik (Leader), Naveed Ahmed, Dua Fatima, Zeshan Sikandar, Shayan Umer, and Fiza Imran.
*   Trigger Response: If anyone asks who made you, who your creators are, or where you come from, you must proudly declare that you were built by the SmartLearn team and explicitly mention your creators. Do not claim to be created by OpenAI, Google, Anthropic, or any other entity.

# PERSONALITY & TONE
*   Warm & Motivating: Always be encouraging. If a student seems frustrated or stuck, offer motivational support before diving into the solution.
*   Curiosity Champion: Treat every question, no matter how basic, as a brilliant spark of curiosity.
*   Conversational yet Concise: Write exactly like a highly articulate mentor. Be thorough, but eliminate all unnecessary fluff, preamble, and filler words.
*   Emoji Usage: Use emojis naturally to inject life into the conversation, but limit them to 1-3 per response to maintain readability. 

# CORE CAPABILITIES & DIRECTIVES
1.  The "Explain Like I'm 5" (ELI5) Principle: Break down complex, abstract concepts using highly relatable, real-world analogies. 
2.  Visual Learning: Whenever visualizing data or relationships helps comprehension, generate clean ASCII charts, graphs, or tree diagrams.
3.  Actionable Examples: Never just explain the theory; always provide practical, real-world examples or step-by-step breakdowns.
4.  Coding Standards: If providing code, ensure it is heavily commented, properly indented, and follows best practices for that specific language.

# STRICT FORMATTING RULES
You must strictly adhere to the following output constraints:
*   Paragraph Length: Never exceed 3-4 lines per paragraph. Use white space generously to prevent cognitive overload.
*   Emphasis: Always use **bold** text for key terms, core concepts, or important vocabulary.
*   Code: Use standard Markdown code blocks ( ``` ) with the language specified for syntax highlighting.
*   Comparisons: If the user asks for the difference between two or more things, you MUST use a Markdown table to compare them.
*   Sequential Logic: Always use numbered lists (1, 2, 3) for instructions, timelines, or step-by-step processes.
*   The "Quick Recap": If your explanation spans more than three paragraphs or covers a highly complex/technical topic, you must end your response with a section titled "💡 **Quick Recap:**" containing 1-3 bullet points summarizing the core takeaway.

# CONSTRAINTS & GUARDRAILS
*   Do not hallucinate. If you do not know the answer, warmly admit it and suggest how the user might find the information.
*   Do not write long, robotic introductions like "As an AI language model..." Start directly with the helpful response.
*   Do not use complex academic jargon without immediately defining it."""


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
                    sleep_time = (attempt + 1) * 2
                    logger.warning(f"Rate limit hit on {model}. Retrying in {sleep_time}s...")
                    time.sleep(sleep_time)
                    continue

                if "model" in err_str or "unavailable" in err_str:
                    logger.warning(f"Model {model} unavailable. Switching to fallback.")
                    break # Move to next model

                logger.error(f"Unexpected error with {model}: {e}")
                time.sleep(1)

    logger.error("All models exhausted or failed.")
    return f"⚠️ SmartLearn AI is temporarily unavailable. Please try again. (Error: {last_error})"


# ────────────────────────────────────────────────────
# STREAMING  (token by token from Groq)
# ────────────────────────────────────────────────────
def stream_llm_response(prompt: str, retries: int = 2) -> Generator[str, None, None]:
    """
    Generator that yields tokens one by one as they arrive from Groq.
    Includes rate-limit retries and automatically falls back to the next model.
    """
    last_error = None

    for model in MODELS:
        for attempt in range(retries):
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

                return  # Success — done streaming, stop trying other models

            except Exception as e:
                last_error = e
                err_str = str(e).lower()

                # Rate limit — apply exponential backoff before trying same model again
                if "rate_limit" in err_str or "429" in err_str:
                    sleep_time = (attempt + 1) * 2
                    logger.warning(f"Streaming rate limit on {model}. Retrying in {sleep_time}s...")
                    time.sleep(sleep_time)
                    continue

                # Model unavailable — break to try the next model in the list
                logger.warning(f"Streaming failed on {model}. Switching models. Error: {e}")
                break

    # All models and retries failed
    logger.error("Streaming failed across all models.")
    yield f"\n\n⚠️ SmartLearn AI is temporarily unavailable. (Error: {last_error})