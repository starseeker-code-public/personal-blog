"""Canonical feed + publish-webhook endpoints for external frontends.

Two endpoints:
  GET  /api/feed           — paginated feed of the last 9 published posts (3 per page).
  POST /api/feed/webhook   — publish webhook: returns a single post in the canonical
                             format, intended to be fired immediately after a post
                             is published so subscribers receive the payload.
"""

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.post import Post
from app.schemas.post import FeedPage, PostOut, WebhookRequest
from app.security import require_admin
from app.services.cache import cache_delete_pattern, cache_get, cache_set

router = APIRouter(prefix="/api/feed", tags=["feed"])

FEED_WINDOW = 9       # Total posts exposed in the feed
FEED_PAGE_SIZE = 3    # Posts per page
FEED_MAX_PAGE = FEED_WINDOW // FEED_PAGE_SIZE  # 3


def _load_options():
    return [
        selectinload(Post.tags),
        selectinload(Post.category),
        selectinload(Post.author),
    ]


@router.get("", response_model=FeedPage)
async def get_feed(
    page: int = Query(1, ge=1, le=FEED_MAX_PAGE),
    db: AsyncSession = Depends(get_db),
):
    """Last 9 published posts, paginated at 3 per page (max page=3)."""
    cache_key = f"feed:p{page}"
    if cached := await cache_get(cache_key):
        return cached

    # Pull the feed window (up to 9 most recent published posts).
    window_result = await db.execute(
        select(Post)
        .where(Post.draft.is_(False))
        .order_by(Post.published_at.desc())
        .limit(FEED_WINDOW)
        .options(*_load_options())
    )
    window_posts = list(window_result.scalars().all())
    total_posts = len(window_posts)
    total_pages = max(1, (total_posts + FEED_PAGE_SIZE - 1) // FEED_PAGE_SIZE)

    start = (page - 1) * FEED_PAGE_SIZE
    end = start + FEED_PAGE_SIZE
    page_posts = window_posts[start:end]

    response = FeedPage(
        items=[PostOut.from_orm_post(p) for p in page_posts],
        page=page,
        page_size=FEED_PAGE_SIZE,
        total_pages=total_pages,
        total_posts=total_posts,
        has_next=page < total_pages,
        has_prev=page > 1,
    )
    await cache_set(cache_key, response.model_dump(by_alias=True))
    return response


@router.post("/webhook", response_model=PostOut)
async def publish_webhook(
    body: WebhookRequest = Body(default_factory=WebhookRequest),
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    """Publish webhook. Fired when a post is published.

    If a slug is provided in the body, returns that specific post. If no slug
    is provided, returns the most recently published post. Either way the
    response body is the canonical payload subscribers receive.

    Invalidates the feed cache so the next GET /api/feed reflects the change.
    """
    query = select(Post).options(*_load_options())

    if body.slug:
        query = query.where(Post.slug == body.slug)
    else:
        query = (
            query.where(Post.draft.is_(False))
            .order_by(Post.published_at.desc())
            .limit(1)
        )

    result = await db.execute(query)
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Post not found" if body.slug else "No published posts yet",
        )

    # Invalidate the feed cache so the next GET sees the newly-published post.
    await cache_delete_pattern("feed:*")
    await cache_delete_pattern("posts:list:*")

    return PostOut.from_orm_post(post)
