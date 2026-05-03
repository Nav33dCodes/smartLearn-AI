import io
import gc
from pypdf import PdfReader

# Only import pdfplumber if absolutely needed for tables
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

def extract_text_optimized(file_stream) -> str:
    """
    Stream-based extraction to prevent OOM errors on Railway.
    """
    output = []
    
    try:
        # 1. Use pypdf for the metadata and basic check
        # We wrap in BytesIO only if it's not already a stream
        reader = PdfReader(file_stream)
        num_pages = len(reader.pages)
        
        # Performance trick: Process only a few pages with pypdf to check quality
        # if the first page is empty, it might be a complex layout/scan
        first_page_text = reader.pages[0].extract_text() or ""
        
        # Switch to pdfplumber ONLY if pypdf fails or if you need high-fidelity tables
        if PDFPLUMBER_AVAILABLE and len(first_page_text.strip()) < 50:
            file_stream.seek(0) # Reset stream position
            with pdfplumber.open(file_stream) as pdf:
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text() or ""
                    # Table extraction is slow/heavy; only do it if necessary
                    tables = page.extract_tables()
                    if tables:
                        table_data = "\n".join([" | ".join([str(c or "").strip() for c in row]) for table in tables for row in table])
                        text += f"\n{table_data}"
                    
                    output.append(f"[Page {i+1}]\n{text}")
                    # Free memory per page
                    page.flush_cache() 
        else:
            # Stick with pypdf (Faster & Lower Memory)
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    output.append(f"[Page {i+1}]\n{text.strip()}")

        return "\n\n".join(output)

    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        # Force cleanup
        del output
        gc.collect()

def get_pdf_metadata_fast(file_stream) -> dict:
    """Extract metadata without loading the whole file into memory."""
    try:
        file_stream.seek(0)
        reader = PdfReader(file_stream)
        meta = reader.metadata or {}
        return {
            "pages": len(reader.pages),
            "title": str(meta.get("/Title", "")),
            "author": str(meta.get("/Author", "")),
        }
    except:
        return {"pages": 0, "title": "Unknown", "author": "Unknown"}