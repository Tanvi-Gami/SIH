"""Shared asyncpg connection pool for the FastAPI AI microservice.

The AI service reads the same PostgreSQL database as the Express API
(read-heavy queries for tool-calling / recommendation context). Express
remains the source of truth for writes triggered by user actions; this
service only writes to its own cache tables (ai_recommendations) and never
touches auth/application state directly.
"""
import asyncpg
from app.config import settings

_pool: asyncpg.Pool | None = None


async def init_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(settings.database_url, min_size=1, max_size=10)
    return _pool


async def close_pool():
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("DB pool not initialized. Call init_pool() at startup.")
    return _pool


async def fetch(query: str, *args):
    async with get_pool().acquire() as conn:
        return await conn.fetch(query, *args)


async def fetchrow(query: str, *args):
    async with get_pool().acquire() as conn:
        return await conn.fetchrow(query, *args)


async def execute(query: str, *args):
    async with get_pool().acquire() as conn:
        return await conn.execute(query, *args)
