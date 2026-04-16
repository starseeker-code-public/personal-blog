from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base model that serialises to camelCase on the wire, matching the frontend types."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
        from_attributes=True,
    )


# ---------------------------------------------------------------------------
# Sub-objects
# ---------------------------------------------------------------------------

class AuthorOut(CamelModel):
    name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    socials: Optional[dict[str, str]] = None


class TagOut(CamelModel):
    id: int
    slug: str
    name: str


class CategoryOut(CamelModel):
    id: int
    slug: str
    name: str
    description: Optional[str] = None


class CategoryWithCount(CategoryOut):
    post_count: int = 0


# ---------------------------------------------------------------------------
# Post output
# ---------------------------------------------------------------------------

class PostOut(CamelModel):
    slug: str
    title: str
    excerpt: str
    body: str
    published_at: datetime
    updated_at: Optional[datetime] = None
    read_time_minutes: int
    cover_image: Optional[str] = None
    draft: bool = False
    tags: list[str] = []
    category: str = ""
    author: Optional[AuthorOut] = None

    @classmethod
    def from_orm_post(cls, post) -> "PostOut":
        author_out: Optional[AuthorOut] = None
        if post.author:
            socials: dict[str, str] = {}
            for field in ("github", "linkedin", "twitter", "email"):
                val = getattr(post.author, field, None)
                if val:
                    socials[field] = val
            author_out = AuthorOut(
                name=post.author.name,
                avatar=post.author.avatar,
                bio=post.author.bio,
                socials=socials or None,
            )

        return cls(
            slug=post.slug,
            title=post.title,
            excerpt=post.excerpt,
            body=post.body,
            published_at=post.published_at,
            updated_at=post.updated_at,
            read_time_minutes=post.read_time_minutes,
            cover_image=post.cover_image,
            draft=post.draft,
            tags=[t.name for t in (post.tags or [])],
            category=post.category.name if post.category else "",
            author=author_out,
        )


# ---------------------------------------------------------------------------
# Post input
# ---------------------------------------------------------------------------

class PostCreate(BaseModel):
    title: str
    excerpt: str = ""
    body: str = ""
    cover_image: Optional[str] = None
    draft: bool = False
    tags: list[str] = []
    category: Optional[str] = None
    author_name: Optional[str] = None
    published_at: Optional[datetime] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None
    cover_image: Optional[str] = None
    draft: Optional[bool] = None
    tags: Optional[list[str]] = None
    category: Optional[str] = None


# ---------------------------------------------------------------------------
# Paginated response
# ---------------------------------------------------------------------------

class PaginatedPosts(CamelModel):
    items: list[PostOut]
    total: int
    page: int
    page_size: int  # → pageSize on the wire
