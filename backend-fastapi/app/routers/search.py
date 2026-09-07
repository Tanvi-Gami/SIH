from fastapi import APIRouter, HTTPException, Query

from app.db import fetch
from app.services.vector_provider import get_vector_provider

router = APIRouter(prefix="/ai", tags=["search"])

TABLE = {"job": "jobs", "internship": "internships"}


@router.get("/search")
async def semantic_search(q: str = Query(...), type: str = Query("internship")):
    """Natural-language semantic search over open jobs/internships (Pinecone when configured,
    local TF-IDF cosine similarity otherwise)."""
    if type not in TABLE:
        raise HTTPException(status_code=400, detail="type must be job or internship.")
    table = TABLE[type]
    rows = await fetch(
        f"""SELECT o.*, c.name AS company_name FROM {table} o JOIN companies c ON c.id = o.company_id
            WHERE o.status = 'open' ORDER BY o.created_at DESC LIMIT 50"""
    )
    candidates = []
    for row in rows:
        r = dict(row)
        candidates.append({**r, "text": f"{r['title']} {r.get('description', '')}"})
    vector_provider = get_vector_provider()
    ranked = await vector_provider.semantic_rank(q, candidates)

    results = [{
        "id": r["id"], "title": r["title"], "company_name": r["company_name"], "location": r.get("location"),
        "relevance": round(r["semantic_score"] * 100),
    } for r in ranked[:10]]

    return {"query": q, "type": type, "provider": vector_provider.name, "results": results}
