from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.post import Post
from app.schemas.post import Lang, PostOut

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=list[PostOut])
async def search_posts(
    q: str = Query(..., min_length=2, max_length=200),
    limit: int = Query(20, ge=1, le=50),
    lang: Lang = Query(Lang.EN),
    db: AsyncSession = Depends(get_db),
):
    """Full-text search over title, excerpt and body in both languages, using
    PostgreSQL tsvector. Results come back in `lang` (English when a post has
    no translation)."""
    query_en = func.plainto_tsquery("english", q)
    query_es = func.plainto_tsquery("spanish", q)

    # Use the pre-built vectors when available, falling back to an inline tsvector.
    vector_en = func.coalesce(
        Post.search_vector, func.to_tsvector("english", Post.title + " " + Post.excerpt)
    )
    vector_es = func.coalesce(
        Post.search_vector_es, func.to_tsvector("spanish", Post.title_es + " " + Post.excerpt_es)
    )

    result = await db.execute(
        select(Post)
        .where(
            Post.draft.is_(False),
            or_(vector_en.op("@@")(query_en), vector_es.op("@@")(query_es)),
        )
        .order_by(
            func.greatest(
                func.ts_rank(vector_en, query_en),
                func.ts_rank(vector_es, query_es),
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
    return [PostOut.from_orm_post(p, lang.value) for p in posts]
