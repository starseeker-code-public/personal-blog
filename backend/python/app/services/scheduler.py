"""APScheduler background jobs.

Jobs registered here:
  - update_search_vectors  every 5 min  — rebuild tsvector for posts that lack one
  - warm_cache             on startup   — pre-populate Redis for the first page
  - generate_rss           every hour   — write /tmp/rss.xml (served by /feed.xml)
"""

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import text

from app.database import AsyncSessionLocal

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


# ---------------------------------------------------------------------------
# Job: rebuild full-text search vectors
# ---------------------------------------------------------------------------

async def update_search_vectors() -> None:
    logger.info("APScheduler: updating search vectors")
    async with AsyncSessionLocal() as db:
        await db.execute(
            text(
                """
                UPDATE posts
                SET search_vector = to_tsvector('english',
                    coalesce(title, '') || ' ' ||
                    coalesce(excerpt, '') || ' ' ||
                    coalesce(body, '')
                )
                WHERE search_vector IS NULL
                   OR updated_at > now() - interval '10 minutes'
                """
            )
        )
        await db.commit()
    logger.info("APScheduler: search vectors updated")


# ---------------------------------------------------------------------------
# Job: warm the first-page cache
# ---------------------------------------------------------------------------

async def warm_cache() -> None:
    logger.info("APScheduler: warming cache")
    try:
        # Import here to avoid circular deps at module load time
        from app.services.cache import cache_delete_pattern

        await cache_delete_pattern("posts:list:*")
        # The next real request will repopulate. Nothing more needed here.
    except Exception as exc:
        logger.warning("Cache warm-up failed: %s", exc)


# ---------------------------------------------------------------------------
# Job: generate RSS feed file
# ---------------------------------------------------------------------------

async def generate_rss() -> None:
    logger.info("APScheduler: generating RSS feed")
    try:
        from feedgen.feed import FeedGenerator

        from app.config import settings
        from app.models.post import Post
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload

        fg = FeedGenerator()
        fg.id(settings.site_url)
        fg.title(settings.site_name)
        fg.link(href=settings.site_url, rel="alternate")
        fg.language("en")
        fg.description(settings.site_name)

        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Post)
                .where(Post.draft.is_(False))
                .order_by(Post.published_at.desc())
                .limit(20)
                .options(selectinload(Post.author))
            )
            posts = result.scalars().all()

        for post in posts:
            fe = fg.add_entry()
            fe.id(f"{settings.site_url}/posts/{post.slug}")
            fe.title(post.title)
            fe.link(href=f"{settings.site_url}/posts/{post.slug}")
            fe.summary(post.excerpt)
            fe.published(post.published_at)
            if post.updated_at:
                fe.updated(post.updated_at)
            if post.author:
                fe.author(name=post.author.name)

        fg.atom_file("/tmp/feed.xml")
        logger.info("APScheduler: RSS feed written")
    except Exception as exc:
        logger.warning("RSS generation failed: %s", exc)


# ---------------------------------------------------------------------------
# Scheduler setup
# ---------------------------------------------------------------------------

def setup_scheduler() -> AsyncIOScheduler:
    scheduler.add_job(
        update_search_vectors,
        trigger=IntervalTrigger(minutes=5),
        id="update_search_vectors",
        replace_existing=True,
    )
    scheduler.add_job(
        warm_cache,
        trigger=IntervalTrigger(hours=1),
        id="warm_cache",
        replace_existing=True,
    )
    scheduler.add_job(
        generate_rss,
        trigger=CronTrigger(minute=0),  # top of every hour
        id="generate_rss",
        replace_existing=True,
    )
    return scheduler
