import io
from pypdf import PdfReader

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

# FIXED: Limit pages processed — a 300-page PDF was reading ALL pages
# = massive RAM spike + slow response. 80 pages is enough for most docs.
MAX_PAGES = 80

# FIXED: Cap total text size sent to embeddings — prevents OOM
MAX_TEXT_CHARS = 120_000  # ~30,000 words, plenty


def extract_text_pypdf(file_bytes: bytes) -> str:
    """Fast extraction using pypdf."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    total_chars = 0

    for i, page in enumerate(reader.pages):
        if i >= MAX_PAGES:
            pages.append(f"\n\n[Note: Document truncated at page {MAX_PAGES} to save memory]")
            break

        text = page.extract_text() or ""
        text = text.strip()
        if not text:
            continue

        pages.append(f"[Page {i+1}]\n{text}")
        total_chars += len(text)

        # Stop early if we hit text cap
        if total_chars >= MAX_TEXT_CHARS:
            pages.append(f"\n\n[Note: Text capped at {MAX_TEXT_CHARS} characters]")
            break

    return "\n\n".join(pages)


def extract_text_pdfplumber(file_bytes: bytes) -> str:
    """Fallback extraction using pdfplumber (better for tables)."""
    pages = []
    total_chars = 0

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            if i >= MAX_PAGES:
                break

            text = page.extract_text() or ""

            # Extract tables
            table_texts = []
            try:
                tables = page.extract_tables()
                for table in (tables or []):
                    for row in (table or []):
                        if row:
                            cleaned = [str(cell or "").strip() for cell in row]
                            line = " | ".join(c for c in cleaned if c)
                            if line:
                                table_texts.append(line)
            except Exception:
                pass  # skip table extraction errors silently

            combined = text.strip()
            if table_texts:
                combined += "\n\nTables:\n" + "\n".join(table_texts)

            if combined.strip():
                pages.append(f"[Page {i+1}]\n{combined}")
                total_chars += len(combined)

            if total_chars >= MAX_TEXT_CHARS:
                break

    return "\n\n".join(pages)


def extract_text(file) -> str:
    """
    Smart extraction with page + size limits.
    Tries pypdf first, falls back to pdfplumber only if needed.
    """
    try:
        # FIXED: Read bytes once — previous code was reading file twice
        if hasattr(file, 'read'):
            file_bytes = file.read()
        else:
            file_bytes = bytes(file)

        if not file_bytes:
            return ""

        # Try pypdf first (faster, lower memory)
        pypdf_text = extract_text_pypdf(file_bytes)

        # If we got enough text, use it — don't run pdfplumber too
        if len(pypdf_text.strip()) > 300:
            return pypdf_text

        # Only fall back to pdfplumber if pypdf result is poor
        if PDFPLUMBER_AVAILABLE:
            plumber_text = extract_text_pdfplumber(file_bytes)
            if len(plumber_text.strip()) > len(pypdf_text.strip()):
                return plumber_text

        return pypdf_text

    except Exception as e:
        return f"PDF extraction error: {str(e)}"


def get_pdf_metadata(file) -> dict:
    """Get basic PDF metadata without loading full content."""
    try:
        if hasattr(file, 'read'):
            file_bytes = file.read()
        else:
            file_bytes = bytes(file)

        reader = PdfReader(io.BytesIO(file_bytes))
        meta = reader.metadata or {}
        return {
            "pages": len(reader.pages),
            "title": str(meta.get("/Title", "") or ""),
            "author": str(meta.get("/Author", "") or ""),
        }
    except Exception:
        return {"pages": 0, "title": "", "author": ""}