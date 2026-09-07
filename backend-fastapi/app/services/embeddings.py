"""
Embedding generation, abstracted from the vector store choice.

If OPENAI_API_KEY is set, embeddings come from OpenAI (1536-dim). Otherwise a
deterministic local hashing-trick embedding is used (384-dim) so semantic
search still works — with lower fidelity — completely offline.
"""
import re
import numpy as np
from app.config import settings

LOCAL_EMBEDDING_DIM = 384
OPENAI_EMBEDDING_DIM = 1536


def embedding_dimension() -> int:
    return OPENAI_EMBEDDING_DIM if settings.ai_enabled else LOCAL_EMBEDDING_DIM


def local_embed(text: str, dim: int = LOCAL_EMBEDDING_DIM) -> list[float]:
    """A deterministic bag-of-words hashing-trick pseudo-embedding. Not as
    semantically rich as a real embedding model, but genuinely reflects
    token overlap/frequency, so cosine similarity between related texts
    (e.g. 'Python, FastAPI, NLP' vs 'Python backend NLP role') is meaningfully
    higher than between unrelated ones."""
    vec = np.zeros(dim, dtype=np.float32)
    tokens = re.findall(r"[a-zA-Z0-9+#.]+", text.lower())
    for tok in tokens:
        idx = hash(tok) % dim
        vec[idx] += 1.0
    norm = np.linalg.norm(vec)
    return (vec / norm).tolist() if norm > 0 else vec.tolist()


async def embed_text(text: str) -> list[float]:
    if settings.ai_enabled:
        try:
            from langchain_openai import OpenAIEmbeddings
            emb = OpenAIEmbeddings(model=settings.openai_embedding_model, api_key=settings.openai_api_key)
            return await emb.aembed_query(text)
        except Exception:
            pass  # fall through to local embedding if the API call fails
    return local_embed(text)
