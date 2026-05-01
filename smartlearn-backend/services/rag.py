from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

index = None
chunks = []

# ------------------------
# CHUNKING
# ------------------------
def create_chunks(text, size=500):
    return [text[i:i+size] for i in range(0, len(text), size)]


# ------------------------
# STORE  PDF
# ------------------------
def store_pdf(text):
    global index, chunks

    chunks = create_chunks(text)

    if len(chunks) == 0:
        return

    embeddings = model.encode(chunks)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings))


# ------------------------
# SEARCH
# ------------------------
def search(query, k=3):
    global index, chunks

    if index is None or len(chunks) == 0:
        return ""

    q_emb = model.encode([query])
    distances, indices = index.search(np.array(q_emb), k)

    results = [chunks[i] for i in indices[0] if i < len(chunks)]

    return "\n\n".join(results)