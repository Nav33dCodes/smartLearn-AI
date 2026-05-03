from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import re

# ── Load model once at startup ──
model = SentenceTransformer("all-MiniLM-L6-v2")

# ── Per-session storage: chat_id → {index, chunks} ──
# This allows multiple users / chat sessions to have separate PDF contexts
_sessions: dict[str, dict] = {}

# ── Global fallback (for single-user / no session) ──
_global_index = None
_global_chunks = []


# ────────────────────────────────────────────────────
# CHUNKING — smart sentence-aware splitting
# ────────────────────────────────────────────────────
def create_chunks(text: str, size: int = 500, overlap: int = 80) -> list[str]:
    """
    Split text into overlapping chunks.
    Overlap helps preserve context at chunk boundaries.
    """
    # Clean up excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + size

        # Try to break at a sentence boundary (. ! ?)
        if end < text_len:
            boundary = text.rfind('. ', start, end)
            if boundary == -1:
                boundary = text.rfind('\n', start, end)
            if boundary != -1 and boundary > start + (size // 2):
                end = boundary + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Move forward with overlap
        start = end - overlap if end < text_len else text_len

    return chunks


# ────────────────────────────────────────────────────
# STORE PDF — with optional session isolation
# ────────────────────────────────────────────────────
def store_pdf(text: str, chat_id: str = None) -> int:
    """
    Embed and store PDF chunks.
    If chat_id provided, stores per-session (isolated).
    Returns number of chunks stored.
    """
    global _global_index, _global_chunks

    chunks = create_chunks(text)
    if not chunks:
        return 0

    embeddings = model.encode(chunks, show_progress_bar=False)
    embeddings = np.array(embeddings, dtype="float32")

    dim = embeddings.shape[1]
    idx = faiss.IndexFlatL2(dim)
    idx.add(embeddings)

    if chat_id:
        _sessions[chat_id] = {"index": idx, "chunks": chunks}
    else:
        _global_index = idx
        _global_chunks = chunks

    return len(chunks)


# ────────────────────────────────────────────────────
# SEARCH — retrieve most relevant chunks
# ────────────────────────────────────────────────────
def search(query: str, chat_id: str = None, k: int = 4) -> str:
    """
    Search for relevant context.
    Checks session store first, then global store.
    Returns joined context string, or empty string if nothing found.
    """
    # Pick the right store
    if chat_id and chat_id in _sessions:
        idx = _sessions[chat_id]["index"]
        chunks = _sessions[chat_id]["chunks"]
    else:
        idx = _global_index
        chunks = _global_chunks

    if idx is None or not chunks:
        return ""

    try:
        q_emb = model.encode([query])
        q_emb = np.array(q_emb, dtype="float32")

        distances, indices = idx.search(q_emb, k)

        # Filter out low-relevance results (L2 distance threshold)
        results = []
        for dist, i in zip(distances[0], indices[0]):
            if i < len(chunks) and dist < 1.8:  # tune threshold as needed
                results.append(chunks[i])

        return "\n\n".join(results)

    except Exception as e:
        print(f"RAG search error: {e}")
        return ""


# ────────────────────────────────────────────────────
# UTILS
# ────────────────────────────────────────────────────
def clear_session(chat_id: str) -> None:
    """Remove PDF context for a specific chat session."""
    _sessions.pop(chat_id, None)


def has_context(chat_id: str = None) -> bool:
    """Check if any PDF context is loaded for this session."""
    if chat_id and chat_id in _sessions:
        return True
    return _global_index is not None


def get_stats(chat_id: str = None) -> dict:
    """Return info about loaded context."""
    if chat_id and chat_id in _sessions:
        chunks = _sessions[chat_id]["chunks"]
        return {"session": chat_id, "chunks": len(chunks), "source": "session"}
    if _global_chunks:
        return {"session": "global", "chunks": len(_global_chunks), "source": "global"}
    return {"session": None, "chunks": 0, "source": "none"}