from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import re
import gc
from collections import OrderedDict

# ── Load model once at startup ──
# (Note: PyTorch still uses ~300MB of RAM. If you still OOM after this fix, 
# you will need to switch to an API-based embedder like OpenAI/Cohere).
model = SentenceTransformer("all-MiniLM-L6-v2")

# ── Per-session storage: chat_id → {index, chunks} ──
# FIX: Use OrderedDict as a pseudo-LRU cache to prevent infinite memory leaks
MAX_SESSIONS = 10 
_sessions: OrderedDict[str, dict] = OrderedDict()

# ── Global fallback (for single-user / no session) ──
_global_index = None
_global_chunks = []


# ────────────────────────────────────────────────────
# CHUNKING — smart sentence-aware splitting
# ────────────────────────────────────────────────────
def create_chunks(text: str, size: int = 500, overlap: int = 80) -> list[str]:
    """Split text into overlapping chunks."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + size

        if end < text_len:
            boundary = text.rfind('. ', start, end)
            if boundary == -1:
                boundary = text.rfind('\n', start, end)
            if boundary != -1 and boundary > start + (size // 2):
                end = boundary + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap if end < text_len else text_len

    return chunks


# ────────────────────────────────────────────────────
# STORE PDF — Memory Optimized
# ────────────────────────────────────────────────────
def store_pdf(text: str, chat_id: str = None) -> int:
    """Embed and store PDF chunks with limits to prevent Railway OOM."""
    global _global_index, _global_chunks

    chunks = create_chunks(text)
    if not chunks:
        return 0

    try:
        # FIX 1: Add a strict batch_size (default is usually 32).
        # Lowering this to 8 or 16 stops PyTorch from allocating massive RAM spikes.
        embeddings = model.encode(chunks, batch_size=8, show_progress_bar=False)
        embeddings = np.array(embeddings, dtype="float32")

        dim = embeddings.shape[1]
        idx = faiss.IndexFlatL2(dim)
        idx.add(embeddings)

        if chat_id:
            # FIX 2: Prevent dictionary from growing forever
            if chat_id in _sessions:
                del _sessions[chat_id] # Remove so we can push to the end
            elif len(_sessions) >= MAX_SESSIONS:
                # Remove the oldest session to free up memory
                oldest_chat, _ = _sessions.popitem(last=False)
            
            _sessions[chat_id] = {"index": idx, "chunks": chunks}
        else:
            _global_index = idx
            _global_chunks = chunks

        return len(chunks)

    finally:
        # FIX 3: Force cleanup of temporary tensors
        del embeddings
        gc.collect()


# ────────────────────────────────────────────────────
# SEARCH — retrieve most relevant chunks
# ────────────────────────────────────────────────────
def search(query: str, chat_id: str = None, k: int = 4) -> str:
    """Search for relevant context."""
    if chat_id and chat_id in _sessions:
        # Move to end to mark as recently used
        session_data = _sessions.pop(chat_id)
        _sessions[chat_id] = session_data
        
        idx = session_data["index"]
        chunks = session_data["chunks"]
    else:
        idx = _global_index
        chunks = _global_chunks

    if idx is None or not chunks:
        return ""

    try:
        # Encode query
        q_emb = model.encode([query], show_progress_bar=False)
        q_emb = np.array(q_emb, dtype="float32")

        distances, indices = idx.search(q_emb, k)

        results = []
        for dist, i in zip(distances[0], indices[0]):
            if i < len(chunks) and dist < 1.8:  
                results.append(chunks[i])

        return "\n\n".join(results)

    except Exception as e:
        print(f"RAG search error: {e}")
        return ""
    finally:
        gc.collect()


# ────────────────────────────────────────────────────
# UTILS
# ────────────────────────────────────────────────────
def clear_session(chat_id: str) -> None:
    """Remove PDF context for a specific chat session."""
    _sessions.pop(chat_id, None)
    gc.collect()

def has_context(chat_id: str = None) -> bool:
    """Check if any PDF context is loaded for this session."""
    if chat_id and chat_id in _sessions:
        return True
    return _global_index is not None

def get_stats(chat_id: str = None) -> dict:
    """Return info about loaded context."""
    if chat_id and chat_id in _sessions:
        chunks = _sessions[chat_id]["chunks"]
        return {"session": chat_id, "chunks": len(chunks), "source": "session", "active_sessions_in_memory": len(_sessions)}
    if _global_chunks:
        return {"session": "global", "chunks": len(_global_chunks), "source": "global"}
    return {"session": None, "chunks": 0, "source": "none"}