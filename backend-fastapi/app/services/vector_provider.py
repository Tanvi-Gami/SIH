"""
Vector/semantic-search provider abstraction.

    VectorProvider
     ├── PineconeProvider     (real vector DB, used when PINECONE_API_KEY is set)
     └── MockVectorProvider   (local TF-IDF cosine similarity, always available)

Both implement `semantic_rank(query_text, candidates)` where each candidate is
{"id": str, "text": str, ...metadata}. Returns the same candidates annotated
with a `semantic_score` in [0, 1] and sorted descending.
"""
import uuid
from abc import ABC, abstractmethod
from typing import Any

from app.config import settings
from app.services.embeddings import embed_text


class VectorProvider(ABC):
    name: str = "base"

    @abstractmethod
    async def semantic_rank(self, query_text: str, candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        ...


class MockVectorProvider(VectorProvider):
    name = "mock"

    async def semantic_rank(self, query_text: str, candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not candidates:
            return []
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        texts = [c.get("text", "") or "" for c in candidates]
        try:
            vectorizer = TfidfVectorizer(stop_words="english")
            matrix = vectorizer.fit_transform(texts + [query_text])
            sims = cosine_similarity(matrix[-1], matrix[:-1]).flatten()
        except ValueError:
            # e.g. all-empty vocabulary — fall back to zero similarity rather than crashing.
            sims = [0.0] * len(candidates)

        for c, s in zip(candidates, sims):
            c["semantic_score"] = float(max(0.0, min(1.0, s)))
        return sorted(candidates, key=lambda c: c["semantic_score"], reverse=True)


class PineconeProvider(VectorProvider):
    name = "pinecone"

    def __init__(self):
        from pinecone import Pinecone, ServerlessSpec

        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        from app.services.embeddings import embedding_dimension
        dim = embedding_dimension()
        existing = [i["name"] for i in self.pc.list_indexes()]
        if settings.pinecone_index not in existing:
            self.pc.create_index(
                name=settings.pinecone_index,
                dimension=dim,
                metric="cosine",
                spec=ServerlessSpec(cloud=settings.pinecone_cloud, region=settings.pinecone_region),
            )
        self.index = self.pc.Index(settings.pinecone_index)

    async def semantic_rank(self, query_text: str, candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not candidates:
            return []
        # Isolate each request in its own namespace so scoring only ever
        # considers the current candidate set, regardless of index history.
        namespace = f"req-{uuid.uuid4().hex[:12]}"
        vectors = []
        for c in candidates:
            emb = await embed_text(c.get("text", "") or c["id"])
            vectors.append({"id": str(c["id"]), "values": emb})
        self.index.upsert(vectors=vectors, namespace=namespace)

        query_emb = await embed_text(query_text)
        result = self.index.query(vector=query_emb, top_k=len(candidates), namespace=namespace, include_values=False)

        scores = {m["id"]: m["score"] for m in result.get("matches", [])}
        for c in candidates:
            c["semantic_score"] = float(scores.get(str(c["id"]), 0.0))

        try:
            self.index.delete(delete_all=True, namespace=namespace)
        except Exception:
            pass  # best-effort cleanup; stale namespaces don't affect correctness

        return sorted(candidates, key=lambda c: c["semantic_score"], reverse=True)


_provider_instance: VectorProvider | None = None


def get_vector_provider() -> VectorProvider:
    global _provider_instance
    if _provider_instance is None:
        if settings.vector_enabled:
            try:
                _provider_instance = PineconeProvider()
            except Exception:
                _provider_instance = MockVectorProvider()
        else:
            _provider_instance = MockVectorProvider()
    return _provider_instance
