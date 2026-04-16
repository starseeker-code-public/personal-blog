from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.post import Category, Post
from app.schemas.post import CategoryWithCount

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryWithCount])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            Category,
            func.count(Post.id).label("post_count"),
        )
        .outerjoin(Post, (Post.category_id == Category.id) & (Post.draft.is_(False)))
        .group_by(Category.id)
        .order_by(Category.name)
    )
    rows = result.all()
    return [
        CategoryWithCount(
            id=row.Category.id,
            slug=row.Category.slug,
            name=row.Category.name,
            description=row.Category.description,
            post_count=row.post_count,
        )
        for row in rows
    ]


@router.get("/{slug}", response_model=CategoryWithCount)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            Category,
            func.count(Post.id).label("post_count"),
        )
        .outerjoin(Post, (Post.category_id == Category.id) & (Post.draft.is_(False)))
        .where(Category.slug == slug)
        .group_by(Category.id)
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryWithCount(
        id=row.Category.id,
        slug=row.Category.slug,
        name=row.Category.name,
        description=row.Category.description,
        post_count=row.post_count,
    )
