import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = "tencent/hy3:free"


def answer_from_pages(pages: list[dict], question: str) -> str:
    """Return an answer grounded in the supplied PDF pages, or an empty string."""
    system_prompt = (
        "You answer questions using only the supplied PDF pages below. "
        "Base every factual claim on at least one page and cite it as [Page X]. "
        "When pages disagree, note the conflict with citations. "
        "If the supplied text does not contain enough evidence to answer, "
        "say so clearly — do not guess. "
        "Never cite a page that does not exist in the supplied text."
    )

    non_empty = [p for p in pages if p["text"]]
    page_blocks = "\n\n".join(
        f"### [Page {p['page']}]\n{p['text']}" for p in non_empty
    )
    user_prompt = f"{page_blocks}\n\nQuestion: {question}"

    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )
        response = client.chat.completions.create(
            model=MODEL,
            temperature=0.0,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception:
        return ""
