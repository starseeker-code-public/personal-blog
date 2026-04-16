from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.post import Post
from app.schemas.post import PostOut

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=list[PostOut])
async def search_posts(
    q: str = Query(..., min_length=2, max_length=200),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Full-text search over title, excerpt, and body using PostgreSQL tsvector."""
    tsquery = func.plainto_tsquery("english", q)

    # Use pre-built search_vector when available, fall back to inline tsvector
    result = await db.execute(
        select(Post)
        .where(
            Post.draft.is_(False),
            func.coalesce(Post.search_vector, func.to_tsvector("english", Post.title + " " + Post.excerpt)).op("@@")(tsquery),
        )
        .order_by(
            func.ts_rank(
                func.coalesce(Post.search_vector, func.to_tsvector("english", Post.title + " " + Post.excerpt)),
                tsquery,
            ).desc()
        )
        .limit(limit)
        .options(
            selectinload(Post.tags),
            selectinload(Post.category),
            selectinload(Post.author),
        )
    )
    posts = result.scalars().all()
    return [PostOut.from_orm_post(p) for p in posts]
