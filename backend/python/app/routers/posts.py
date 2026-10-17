from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.post import Category, Post, Tag
from app.schemas.post import (
    Lang,
    PaginatedPosts,
    PostAdminOut,
    PostCreate,
    PostOut,
    PostUpdate,
    available_langs,
)
from app.security import require_admin
from app.services.cache import cache_delete_pattern, cache_get, cache_set
from app.services.mailer import send_love_letter

router = APIRouter(prefix="/api/posts", tags=["posts"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _calc_read_time(body: str) -> int:
    words = len(body.split())
    return max(1, round(words / 200))


async def _get_or_create_tag(db: AsyncSession, name: str) -> Tag:
    slug = slugify(name)
    result = await db.execute(select(Tag).where(Tag.slug == slug))
    tag = result.scalar_one_or_none()
    if tag is None:
        tag = Tag(slug=slug, name=name)
        db.add(tag)
        await db.flush()
    return tag


async def _get_or_create_category(db: AsyncSession, name: str) -> Category:
    slug = slugify(name)
    result = await db.execute(select(Category).where(Category.slug == slug))
    category = result.scalar_one_or_none()
    if category is None:
        category = Category(slug=slug, name=name)
        db.add(category)
        await db.flush()
    return category


def _load_options():
    return [
        selectinload(Post.tags),
        selectinload(Post.category),
        selectinload(Post.author),
    ]


def _has_love_tag(post: Post) -> bool:
    return any(t.name == "love" for t in post.tags)


async def _send_pending_love_letter(db: AsyncSession, post: Post) -> None:
    """Send the love letter a post is waiting on, once the post is live.

    The opt-in is stored on the post, so a draft sends it when it's published.
    The letter is in Spanish, or in English when the post has no Spanish
    version. A failed send stays pending and is retried on the next save.
    """
    if not post.love_letter_pending or post.draft or not _has_love_tag(post):
        return

    if Lang.ES.value in available_langs(post):
        lang, title, excerpt = Lang.ES.value, post.title_es, post.excerpt_es
    else:
        lang, title, excerpt = Lang.EN.value, post.title, post.excerpt

    if send_love_letter(lang=lang, title=title, slug=post.slug, excerpt=excerpt or ""):
        post.love_letter_pending = False
        post.love_letter_sent_at = datetime.now(timezone.utc)
        await db.commit()


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=PaginatedPosts)
async def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100, alias="pageSize"),
    tag: str | None = Query(None),
    category: str | None = Query(None),
    include_drafts: bool = Query(False, alias="includeDrafts"),
    lang: Lang = Query(Lang.EN),
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"posts:list:p{page}:s{page_size}:tag={tag}:cat={category}:drafts={include_drafts}:lang={lang.value}"
    if cached := await cache_get(cache_key):
        return cached

    base_query = select(Post)
    count_query = select(func.count(Post.id))

    if not include_drafts:
        base_query = base_query.where(Post.draft.is_(False))
        count_query = count_query.where(Post.draft.is_(False))

    if tag:
        base_query = base_query.join(Post.tags).where(Tag.slug == tag)
        count_query = count_query.join(Post.tags).where(Tag.slug == tag)

    if category:
        base_query = base_query.join(Post.category).where(Category.slug == category)
        count_query = count_query.join(Post.category).where(Category.slug == category)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    posts_result = await db.execute(
        base_query
        .order_by(Post.published_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .options(*_load_options())
    )
    posts = posts_result.scalars().all()

    response = PaginatedPosts(
        items=[PostOut.from_orm_post(p, lang.value) for p in posts],
        total=total,
        page=page,
        page_size=page_size,
    )
    await cache_set(cache_key, response.model_dump(by_alias=True))
    return response


@router.get("/{slug}", response_model=PostOut)
async def get_post(
    slug: str,
    lang: Lang = Query(Lang.EN),
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"posts:slug:{slug}:{lang.value}"
    if cached := await cache_get(cache_key):
        return cached

    result = await db.execute(
        select(Post)
        .where(Post.slug == slug)
        .options(*_load_options())
    )
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    out = PostOut.from_orm_post(post, lang.value)
    await cache_set(cache_key, out.model_dump(by_alias=True))
    return out


@router.post("", response_model=PostAdminOut, status_code=201)
async def create_post(
    data: PostCreate,
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    # Generate unique slug
    base_slug = slugify(data.title)
    slug = base_slug
    counter = 1
    while True:
        exists = await db.execute(select(Post).where(Post.slug == slug))
        if exists.scalar_one_or_none() is None:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    post = Post(
        slug=slug,
        title=data.title,
        excerpt=data.excerpt,
        body=data.body,
        title_es=data.title_es,
        excerpt_es=data.excerpt_es,
        body_es=data.body_es,
        cover_image=data.cover_image,
        draft=data.draft,
        read_time_minutes=_calc_read_time(data.body),
        read_time_minutes_es=_calc_read_time(data.body_es),
        published_at=data.published_at or datetime.now(timezone.utc),
    )

    if data.category:
        post.category = await _get_or_create_category(db, data.category.value)

    if data.tags:
        post.tags = [await _get_or_create_tag(db, t) for t in data.tags]

    post.love_letter_pending = data.send_to_loved_one and _has_love_tag(post)

    db.add(post)
    await db.commit()
    await db.refresh(post)

    # Reload with relationships
    result = await db.execute(
        select(Post).where(Post.id == post.id).options(*_load_options())
    )
    post = result.scalar_one()

    await cache_delete_pattern("posts:list:*")
    await cache_delete_pattern("feed:*")

    await _send_pending_love_letter(db, post)
    return PostAdminOut.from_orm_post_admin(post)


@router.put("/{slug}", response_model=PostAdminOut)
async def update_post(
    slug: str,
    data: PostUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    result = await db.execute(
        select(Post).where(Post.slug == slug).options(*_load_options())
    )
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    if data.title is not None:
        post.title = data.title
    if data.excerpt is not None:
        post.excerpt = data.excerpt
    if data.body is not None:
        post.body = data.body
        post.read_time_minutes = _calc_read_time(data.body)
    if data.title_es is not None:
        post.title_es = data.title_es
    if data.excerpt_es is not None:
        post.excerpt_es = data.excerpt_es
    if data.body_es is not None:
        post.body_es = data.body_es
        post.read_time_minutes_es = _calc_read_time(data.body_es)
    if data.cover_image is not None:
        post.cover_image = data.cover_image
    if data.draft is not None:
        post.draft = data.draft
    if data.category is not None:
        post.category = await _get_or_create_category(db, data.category.value)
    if data.tags is not None:
        post.tags = [await _get_or_create_tag(db, t) for t in data.tags]
    if data.send_to_loved_one is not None:
        post.love_letter_pending = data.send_to_loved_one
    # The letter announces a `love` post; dropping the tag drops the letter.
    if not _has_love_tag(post):
        post.love_letter_pending = False

    post.updated_at = datetime.now(timezone.utc)
    await db.commit()

    await cache_delete_pattern(f"posts:slug:{slug}:*")
    await cache_delete_pattern("posts:list:*")
    await cache_delete_pattern("feed:*")

    result = await db.execute(
        select(Post).where(Post.id == post.id).options(*_load_options())
    )
    post = result.scalar_one()

    await _send_pending_love_letter(db, post)
    return PostAdminOut.from_orm_post_admin(post)


@router.delete("/{slug}", status_code=204)
async def delete_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    result = await db.execute(select(Post).where(Post.slug == slug))
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    await db.delete(post)
    await db.commit()

    await cache_delete_pattern(f"posts:slug:{slug}:*")
    await cache_delete_pattern("posts:list:*")
    await cache_delete_pattern("feed:*")
