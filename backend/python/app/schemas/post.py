from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CategoryName(str, Enum):
    """Fixed list of post categories. Mirrors the three pillars on /about."""

    ENGINEERING = "Engineering"
    HOBBIES = "Hobbies"
    PERSONAL_LIFE = "Personal Life"


class Lang(str, Enum):
    """Content languages. English is the primary language; Spanish is the translation."""

    EN = "en"
    ES = "es"


def available_langs(post) -> list[str]:
    """Languages a post is written in: those with both a title and a body. English first."""
    langs = []
    if post.title and post.body:
        langs.append(Lang.EN.value)
    if post.title_es and post.body_es:
        langs.append(Lang.ES.value)
    return langs or [Lang.EN.value]


def _content(post, lang: str) -> dict:
    """The language-specific fields of a post, exactly as stored."""
    if lang == Lang.ES.value:
        return {
            "title": post.title_es or "",
            "excerpt": post.excerpt_es or "",
            "body": post.body_es or "",
            "read_time_minutes": post.read_time_minutes_es or 1,
        }
    return {
        "title": post.title,
        "excerpt": post.excerpt,
        "body": post.body,
        "read_time_minutes": post.read_time_minutes,
    }


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
    # Language of title / excerpt / body: the one requested, or English when
    # the post has no translation in that language.
    lang: str = Lang.EN.value
    available_langs: list[str] = [Lang.EN.value]
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
    def from_orm_post(cls, post, lang: str = Lang.EN.value) -> "PostOut":
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

        langs = available_langs(post)
        shown = lang if lang in langs else langs[0]

        return cls(
            slug=post.slug,
            lang=shown,
            available_langs=langs,
            **_content(post, shown),
            published_at=post.published_at,
            updated_at=post.updated_at,
            cover_image=post.cover_image,
            draft=post.draft,
            tags=[t.name for t in (post.tags or [])],
            category=post.category.name if post.category else "",
            author=author_out,
        )


class PostAdminOut(PostOut):
    """Admin shape for editing: the English fields as stored, plus the Spanish translation."""

    title_es: str = ""
    excerpt_es: str = ""
    body_es: str = ""

    @classmethod
    def from_orm_post_admin(cls, post) -> "PostAdminOut":
        data = PostOut.from_orm_post(post).model_dump()
        data.update(lang=Lang.EN.value, **_content(post, Lang.EN.value))
        return cls(
            **data,
            title_es=post.title_es or "",
            excerpt_es=post.excerpt_es or "",
            body_es=post.body_es or "",
        )


# ---------------------------------------------------------------------------
# Post input
# ---------------------------------------------------------------------------

class PostCreate(CamelModel):
    # English, the primary language. The slug is built from this title.
    title: str
    excerpt: str = ""
    body: str = ""
    # Spanish translation (optional).
    title_es: str = ""
    excerpt_es: str = ""
    body_es: str = ""
    cover_image: Optional[str] = None
    draft: bool = False
    tags: list[str] = []
    category: Optional[CategoryName] = None
    author_name: Optional[str] = None
    published_at: Optional[datetime] = None
    # Opt-in by the composer. The backend fires the love-letter email only
    # when this is True AND `draft` is False AND the `love` tag is present.
    send_to_loved_one: bool = False


class PostUpdate(CamelModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None
    title_es: Optional[str] = None
    excerpt_es: Optional[str] = None
    body_es: Optional[str] = None
    cover_image: Optional[str] = None
    draft: Optional[bool] = None
    tags: Optional[list[str]] = None
    category: Optional[CategoryName] = None


# ---------------------------------------------------------------------------
# Paginated response
# ---------------------------------------------------------------------------

class PaginatedPosts(CamelModel):
    items: list[PostOut]
    total: int
    page: int
    page_size: int  # → pageSize on the wire


# ---------------------------------------------------------------------------
# Feed response (canonical, for external frontends)
# ---------------------------------------------------------------------------

class FeedPage(CamelModel):
    """Canonical paginated feed response.

    Always paginates the last 9 published posts at 3 per page (max 3 pages).
    """

    items: list[PostOut]
    page: int
    page_size: int
    total_pages: int
    total_posts: int
    has_next: bool
    has_prev: bool


class WebhookRequest(BaseModel):
    """Optional body for the publish webhook. If slug is omitted, the most
    recently published post is returned."""

    slug: Optional[str] = None


class PortfolioPost(BaseModel):
    """Minimal post shape consumed by the external portfolio frontend."""

    title: str
    date: str        # e.g. "Jun 2026"
    readTime: str    # e.g. "8 min"
    url: str         # absolute URL to the post on the blog frontend
