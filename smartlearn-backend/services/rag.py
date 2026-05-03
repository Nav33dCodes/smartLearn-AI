import faiss
import numpy as np
import re
import gc

# ── FIXED: Model was loading at import time = 400MB RAM used immediately
# Now loads lazily on first use
_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


# ── Per-session storage ──
_sessions: dict = {}

# ── Global fallback ──
_global_index = None
_global_chunks = []

# ── FIXED: Max chunks per session to prevent RAM overflow
# 1 chunk ≈ 500 chars. 300 chunks ≈ 150KB text = enough for a 50-page PDF
MAX_CHUNKS = 300

# ── FIXED: Max sessions in memory at once
MAX_SESSIONS = 5


# ────────────────────────────────────────────────────
# CHUNKING
# ────────────────────────────────────────────────────
def create_chunks(text: str, size: int = 600, overlap: int = 60) -> list:
    # Clean excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    text = text.strip()

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + size

        if end < text_len:
            # Break at sentence boundary
            boundary = text.rfind('. ', start, end)
            if boundary == -1:
                boundary = text.rfind('\n', start, end)
            if boundary != -1 and boundary > start + (size // 2):
                end = boundary + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # FIXED: stop if we hit chunk limit — no need to embed a 500-page PDF
        if len(chunks) >= MAX_CHUNKS:
            break

        start = end - overlap if end < text_len else text_len

    return chunks


# ────────────────────────────────────────────────────
# STORE PDF
# ────────────────────────────────────────────────────
def store_pdf(text: str, chat_id: str = None) -> int:
    global _global_index, _global_chunks

    # FIXED: Evict oldest session if we're over the limit
    if chat_id and len(_sessions) >= MAX_SESSIONS:
        oldest = next(iter(_sessions))
        del _sessions[oldest]
        gc.collect()  # free RAM immediately

    chunks = create_chunks(text)
    if not chunks:
        return 0

    model = get_model()
    # FIXED: batch_size=32 prevents OOM on large PDFs (was encoding all at once)
    embeddings = model.encode(
        chunks,
        batch_size=32,
        show_progress_bar=False,
        convert_to_numpy=True
    )
    embeddings = np.array(embeddings, dtype="float32")

    dim = embeddings.shape[1]
    idx = faiss.IndexFlatL2(dim)
    idx.add(embeddings)

    if chat_id:
        # Clear old session for this chat_id before storing new one
        if chat_id in _sessions:
            del _sessions[chat_id]
            gc.collect()
        _sessions[chat_id] = {"index": idx, "chunks": chunks}
    else:
        _global_index = idx
        _global_chunks = chunks

    return len(chunks)


# ────────────────────────────────────────────────────
# SEARCH
# ────────────────────────────────────────────────────
def search(query: str, chat_id: str = None, k: int = 3) -> str:
    # FIXED: k=3 instead of 4 — less context = faster prompt + smaller token cost

    if chat_id and chat_id in _sessions:
        idx = _sessions[chat_id]["index"]
        chunks = _sessions[chat_id]["chunks"]
    else:
        idx = _global_index
        chunks = _global_chunks

    if idx is None or not chunks:
        return ""

    try:
        model = get_model()
        q_emb = model.encode([query], convert_to_numpy=True)
        q_emb = np.array(q_emb, dtype="float32")

        actual_k = min(k, len(chunks))
        distances, indices = idx.search(q_emb, actual_k)

        results = []
        for dist, i in zip(distances[0], indices[0]):
            if i < len(chunks) and dist < 1.8:
                results.append(chunks[i])

        return "\n\n".join(results)

    except Exception as e:
        print(f"RAG search error: {e}")
        return ""


# ────────────────────────────────────────────────────
# UTILS
# ────────────────────────────────────────────────────
def clear_session(chat_id: str) -> None:
    """Free memory for a deleted chat."""
    if chat_id in _sessions:
        del _sessions[chat_id]
        gc.collect()


def has_context(chat_id: str = None) -> bool:
    if chat_id and chat_id in _sessions:
        return True
    return _global_index is not None


def get_stats(chat_id: str = None) -> dict:
    if chat_id and chat_id in _sessions:
        chunks = _sessions[chat_id]["chunks"]
        return {"session": chat_id, "chunks": len(chunks), "source": "session"}
    if _global_chunks:
        return {"session": "global", "chunks": len(_global_chunks), "source": "global"}
    return {"session": None, "chunks": 0, "source": "none"}