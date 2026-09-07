from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_pool, close_pool
from app.services.ai_provider import get_ai_provider
from app.services.vector_provider import get_vector_provider
from app.routers import resume, recommendations, career_guidance, chat, match, search, industry_analysis


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    print(f"✅ FastAPI AI service started. AI provider: {get_ai_provider().name} | Vector provider: {get_vector_provider().name}")
    yield
    await close_pool()


app = FastAPI(
    title="SIH 26SIH044 — AI Intelligence Service",
    description="Resume analysis, skill-gap analysis, recommendations, semantic search and the AI career assistant.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin, "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "sih-backend-fastapi",
        "ai_provider": get_ai_provider().name,
        "vector_provider": get_vector_provider().name,
    }


app.include_router(resume.router)
app.include_router(recommendations.router)
app.include_router(career_guidance.router)
app.include_router(chat.router)
app.include_router(match.router)
app.include_router(search.router)
app.include_router(industry_analysis.router)
