"""Admin-only endpoints — auth-required, not part of the public API contract."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.post import Post
from app.schemas.post import PostOut
from app.security import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/drafts", response_model=list[PostOut])
async def list_drafts(
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    """All draft posts in canonical PostOut shape, newest first."""
    result = await db.execute(
        select(Post)
        .where(Post.draft.is_(True))
        .order_by(Post.published_at.desc())
        .options(
            selectinload(Post.tags),
            selectinload(Post.category),
            selectinload(Post.author),
        )
    )
    drafts = result.scalars().all()
    return [PostOut.from_orm_post(p) for p in drafts]
