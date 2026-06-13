import faiss
import numpy as np
import re
import gc
import os
import json
import threading

# ── FIXED: Model was loading at import time = 400MB RAM used immediately
# Now loads lazily on first use
_model = None

faiss_lock = threading.Lock()

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


# ── Disk Storage ──
RAG_DIR = "rag_data"
os.makedirs(RAG_DIR, exist_ok=True)

def _get_index_path(chat_id: str) -> str:
    return os.path.join(RAG_DIR, f"{chat_id}_index.bin")

def _get_chunks_path(chat_id: str) -> str:
    return os.path.join(RAG_DIR, f"{chat_id}_chunks.json")

# ── Global fallback ──
_global_index = None
_global_chunks = []

# ── FIXED: Max chunks per session to prevent RAM overflow
# 1 chunk ≈ 500 chars. 300 chunks ≈ 150KB text = enough for a 50-page PDF
MAX_CHUNKS = 300


# ────────────────────────────────────────────────────
# CHUNKING
# ────────────────────────────────────────────────────
def create_chunks(text: str, size: int = 1500, overlap: int = 200) -> list:
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

    with faiss_lock:
        if chat_id:
            # Save to disk instantly to prevent memory leaks
            index_path = _get_index_path(chat_id)
            chunks_path = _get_chunks_path(chat_id)
            
            faiss.write_index(idx, index_path)
            with open(chunks_path, "w", encoding="utf-8") as f:
                json.dump(chunks, f)
                
            # Free FAISS from RAM immediately
            del idx
            gc.collect()
        else:
            _global_index = idx
            _global_chunks = chunks

    return len(chunks)


# ────────────────────────────────────────────────────
# SEARCH
# ────────────────────────────────────────────────────
def search(query: str, chat_id: str = None, k: int = 6) -> str:
    # FIXED: k=6 and chunk size 1500 provides much richer context for detailed answers
    idx = None
    chunks = []
    
    if chat_id:
        index_path = _get_index_path(chat_id)
        chunks_path = _get_chunks_path(chat_id)
        
        if os.path.exists(index_path) and os.path.exists(chunks_path):
            try:
                # Load from disk
                idx = faiss.read_index(index_path)
                with open(chunks_path, "r", encoding="utf-8") as f:
                    chunks = json.load(f)
            except Exception as e:
                print(f"Failed to load RAG disk storage: {e}")
                return ""
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
                
        # Free memory immediately after search
        if chat_id:
            del idx
            del chunks
            gc.collect()

        return "\n\n".join(results)

    except Exception as e:
        print(f"RAG search error: {e}")
        return ""


# ────────────────────────────────────────────────────
# UTILS
# ────────────────────────────────────────────────────
def clear_session(chat_id: str) -> None:
    """Free memory for a deleted chat."""
    index_path = _get_index_path(chat_id)
    chunks_path = _get_chunks_path(chat_id)
    
    if os.path.exists(index_path):
        os.remove(index_path)
    if os.path.exists(chunks_path):
        os.remove(chunks_path)


def has_context(chat_id: str = None) -> bool:
    if chat_id:
        return os.path.exists(_get_index_path(chat_id))
    return _global_index is not None


def get_stats(chat_id: str = None) -> dict:
    if chat_id and os.path.exists(_get_chunks_path(chat_id)):
        try:
            with open(_get_chunks_path(chat_id), "r", encoding="utf-8") as f:
                chunks = json.load(f)
            return {"session": chat_id, "chunks": len(chunks), "source": "disk"}
        except:
            pass
    if _global_chunks:
        return {"session": "global", "chunks": len(_global_chunks), "source": "global"}
    return {"session": None, "chunks": 0, "source": "none"}