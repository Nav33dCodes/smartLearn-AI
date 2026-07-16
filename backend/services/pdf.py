from pathlib import Path

from pypdf import PdfReader


def extract_pages(file_path: str) -> list[dict]:
    """Return page-numbered text dicts for a PDF up to 30 pages."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {file_path}")

    reader = PdfReader(file_path)
    page_count = len(reader.pages)

    if page_count > 30:
        raise ValueError(
            f"PDF exceeds 30-page limit: got {page_count} pages"
        )

    pages: list[dict] = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text()
        pages.append({
            "page": i,
            "text": (text or "").strip(),
        })

    return pages
