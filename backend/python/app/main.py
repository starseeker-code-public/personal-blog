"""FastAPI blog backend — main application entry point."""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.config import settings
from app.database import create_tables
from app.redis_client import close_redis, get_redis
from app.routers import categories, health, posts, search, tags
from app.services.scheduler import setup_scheduler, update_search_vectors

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Creating database tables (if not exist)…")
    await create_tables()

    logger.info("Connecting to Redis…")
    await get_redis()

    logger.info("Starting APScheduler…")
    scheduler = setup_scheduler()
    scheduler.start()

    # Kick off an immediate search-vector rebuild on boot
    await update_search_vectors()

    yield

    # Shutdown
    logger.info("Stopping APScheduler…")
    scheduler.shutdown(wait=False)
    await close_redis()


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Personal Blog API",
    description="FastAPI backend for Joaquín's blog — PostgreSQL, Redis, APScheduler.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(posts.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(search.router)


# ---------------------------------------------------------------------------
# Extra endpoints
# ---------------------------------------------------------------------------

@app.get("/feed.xml", include_in_schema=False)
async def rss_feed():
    feed_path = Path("/tmp/feed.xml")
    if feed_path.exists():
        return FileResponse(feed_path, media_type="application/atom+xml")
    return JSONResponse({"detail": "Feed not yet generated"}, status_code=503)


@app.get("/sitemap.xml", include_in_schema=False)
async def sitemap():
    """Minimal sitemap — lists all published post URLs."""
    from sqlalchemy import select

    from app.database import AsyncSessionLocal
    from app.models.post import Post

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Post.slug, Post.updated_at)
            .where(Post.draft.is_(False))
            .order_by(Post.published_at.desc())
        )
        rows = result.all()

    urls = "\n".join(
        f"  <url><loc>{settings.site_url}/posts/{row.slug}</loc>"
        f"{'<lastmod>' + row.updated_at.date().isoformat() + '</lastmod>' if row.updated_at else ''}"
        f"</url>"
        for row in rows
    )
    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>'
    from fastapi.responses import Response

    return Response(content=xml, media_type="application/xml")
