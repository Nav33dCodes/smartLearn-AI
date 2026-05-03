import io
import gc
from pypdf import PdfReader

# Optimize by making pdfplumber an optional, lazy-loaded dependency
PDFPLUMBER_AVAILABLE = False
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    pass

def extract_text(file) -> str:
    """
    Railway-optimized extraction. 
    Handles both SpooledTemporaryFile (FastAPI) and BytesIO.
    """
    output = []
    try:
        # Step 1: Ensure we are at the start of the file
        if hasattr(file, 'seek'):
            file.seek(0)
        
        # Step 2: Use pypdf for initial light-weight check
        # This prevents loading the whole binary into a string
        reader = PdfReader(file)
        
        # Performance Check: If 1st page is empty/short, it's likely a complex layout
        first_page_text = ""
        if len(reader.pages) > 0:
            first_page_text = reader.pages[0].extract_text() or ""

        # Step 3: Branch logic based on content density
        if PDFPLUMBER_AVAILABLE and len(first_page_text.strip()) < 50:
            # Fallback to pdfplumber for tables/complex layouts
            file.seek(0)
            with pdfplumber.open(file) as pdf:
                for i, page in enumerate(pdf.pages):
                    p_text = page.extract_text() or ""
                    tables = page.extract_tables()
                    if tables:
                        table_str = "\n".join([" | ".join([str(c or "").strip() for c in row]) for table in tables for row in table])
                        p_text += f"\n\nTable data:\n{table_str}"
                    
                    if p_text.strip():
                        output.append(f"[Page {i+1}]\n{p_text}")
                    # CRITICAL: Clear page cache to save RAM
                    page.flush_cache()
        else:
            # High-speed pypdf extraction
            for i, page in enumerate(reader.pages):
                p_text = page.extract_text() or ""
                if p_text.strip():
                    output.append(f"[Page {i+1}]\n{p_text.strip()}")

        return "\n\n".join(output)

    except Exception as e:
        return f"PDF extraction error: {str(e)}"
    finally:
        # Manual garbage collection to assist Railway's limited RAM
        gc.collect()

def get_pdf_metadata(file) -> dict:
    """Lightweight metadata extraction."""
    try:
        if hasattr(file, 'seek'):
            file.seek(0)
        
        reader = PdfReader(file)
        meta = reader.metadata or {}
        return {
            "pages": len(reader.pages),
            "title": str(meta.get("/Title", "")),
            "author": str(meta.get("/Author", "")),
        }
    except Exception:
        return {"pages": 0, "title": "Unknown", "author": "Unknown"}