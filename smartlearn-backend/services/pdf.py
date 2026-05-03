import io
from pypdf import PdfReader

# pdfplumber is better for tables/complex layouts — use as fallback
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False


def extract_text_pypdf(file) -> str:
    """Extract text using pypdf (fast, works for most PDFs)."""
    reader = PdfReader(file)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            pages.append(f"[Page {i+1}]\n{text.strip()}")
    return "\n\n".join(pages)


def extract_text_pdfplumber(file_bytes: bytes) -> str:
    """Extract text using pdfplumber (better for tables and complex layouts)."""
    pages = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""

            # Also extract tables as plain text
            tables = page.extract_tables()
            table_texts = []
            for table in tables:
                for row in table:
                    cleaned = [str(cell or "").strip() for cell in row]
                    table_texts.append(" | ".join(cleaned))

            combined = text.strip()
            if table_texts:
                combined += "\n\nTable data:\n" + "\n".join(table_texts)

            if combined.strip():
                pages.append(f"[Page {i+1}]\n{combined}")

    return "\n\n".join(pages)


def extract_text(file) -> str:
    """
    Smart extraction: tries pypdf first, falls back to pdfplumber
    if the result looks too short (scanned/complex PDF).
    """
    try:
        # Read bytes once so we can reuse
        file_bytes = file.read()

        # Try pypdf first
        pypdf_text = extract_text_pypdf(io.BytesIO(file_bytes))

        # If pypdf got good content, use it
        if len(pypdf_text.strip()) > 200:
            return pypdf_text

        # If pypdf got very little, try pdfplumber
        if PDFPLUMBER_AVAILABLE:
            plumber_text = extract_text_pdfplumber(file_bytes)
            if len(plumber_text.strip()) > len(pypdf_text.strip()):
                return plumber_text

        return pypdf_text

    except Exception as e:
        return f"PDF extraction error: {str(e)}"


def get_pdf_metadata(file) -> dict:
    """Extract basic metadata from a PDF."""
    try:
        file_bytes = file.read() if hasattr(file, 'read') else file
        reader = PdfReader(io.BytesIO(file_bytes))
        meta = reader.metadata or {}
        return {
            "pages": len(reader.pages),
            "title": meta.get("/Title", ""),
            "author": meta.get("/Author", ""),
        }
    except Exception:
        return {"pages": 0, "title": "", "author": ""}