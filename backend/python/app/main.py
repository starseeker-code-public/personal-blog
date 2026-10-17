"""FastAPI blog backend — main application entry point."""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import create_tables
from app.redis_client import close_redis, get_redis
from app.routers import admin, auth, categories, feed, health, posts, search, seo, tags
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
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(posts.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(search.router)
app.include_router(feed.router)
app.include_router(seo.router)

# Uploaded images are served from /uploads. Backed by a Docker volume so
# files survive container rebuilds (see docker-compose.yml).
_uploads = Path("/app/uploads")
_uploads.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads)), name="uploads")


# ---------------------------------------------------------------------------
# Extra endpoints
# ---------------------------------------------------------------------------

@app.get("/feed.xml", include_in_schema=False)
async def rss_feed():
    feed_path = Path("/tmp/feed.xml")
    if feed_path.exists():
        return FileResponse(feed_path, media_type="application/atom+xml")
    return JSONResponse({"detail": "Feed not yet generated"}, status_code=503)


# /sitemap.xml lives in routers/seo.py, next to the page heads it shares its rules with.
