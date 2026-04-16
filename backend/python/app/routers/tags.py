from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.post import Post, Tag, post_tags
from app.schemas.post import TagOut

router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("", response_model=list[TagOut])
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Tag)
        .join(post_tags, Tag.id == post_tags.c.tag_id)
        .join(Post, Post.id == post_tags.c.post_id)
        .where(Post.draft.is_(False))
        .group_by(Tag.id)
        .order_by(func.count(Post.id).desc())
    )
    return result.scalars().all()
