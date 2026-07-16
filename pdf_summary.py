import argparse
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from pypdf import PdfReader

load_dotenv()

MODEL = "tencent/hy3:free"
MAX_PAGES = 80
MAX_TEXT_CHARS = 120_000

SYSTEM_PROMPT = """You are a document summarizer. Produce a structured summary of the PDF text provided.

Include these sections:
1. **Overview** — 2-3 sentence high-level summary
2. **Key Points** — bullet list of main ideas
3. **Details** — short paragraphs expanding on important topics

Cite page numbers as [Page X] whenever you reference specific content.
Only use information from the provided text."""


def clean_pdf_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    paragraphs = []
    for paragraph in text.split("\n\n"):
        paragraph = paragraph.strip()
        paragraph = re.sub(r"(?<!\n)\n(?!\n)", " ", paragraph)
        paragraph = re.sub(r" +", " ", paragraph)
        if paragraph:
            paragraphs.append(paragraph)
    return "\n\n".join(paragraphs)


def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    pages = []
    total_chars = 0

    for i, page in enumerate(reader.pages):
        if i >= MAX_PAGES:
            pages.append(f"[Note: Document truncated at page {MAX_PAGES}]")
            break

        text = clean_pdf_text(page.extract_text() or "")
        if not text:
            continue

        pages.append(f"[Page {i + 1}]\n{text}")
        total_chars += len(text)

        if total_chars >= MAX_TEXT_CHARS:
            pages.append(f"[Note: Text capped at {MAX_TEXT_CHARS} characters]")
            break

    return "\n\n".join(pages)


def summarize(text: str) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY not set in .env", file=sys.stderr)
        sys.exit(1)

    client = OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"PDF text:\n\n{text}"},
        ],
    )
    return response.choices[0].message.content


def main() -> None:
    parser = argparse.ArgumentParser(description="Summarize a PDF file using an LLM.")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    args = parser.parse_args()

    pdf_path = Path(args.pdf_path)
    if not pdf_path.is_file():
        print(f"Error: file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Extracting text from {pdf_path.name}...")
    text = extract_text(pdf_path)
    if not text.strip():
        print("Error: no text could be extracted from the PDF.", file=sys.stderr)
        sys.exit(1)

    print("Generating summary...\n")
    print(summarize(text))


if __name__ == "__main__":
    main()
