"""Page <head> for crawlers: link previews and search engines.

WhatsApp, Instagram, X and the like build a link's preview from the page's
HTML without running its JavaScript, so they never see the tags the app sets
in the browser. nginx (frontend/nginx.conf) serves them index.html with the
tags built here instead, in the language of the link.

The browser's side is frontend/src/seo/head.ts, and TEXT copies the strings
it needs from frontend/src/i18n/locales/{en,es}.ts (`site.name`, `seo`,
`post.notFound`, `notFound.text` and the category names): keep them in step.
Titles read "Page – site name", except the home page's, which is the name.
"""

from dataclasses import dataclass, field
from datetime import datetime
from html import escape as _escape

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models.post import Category, Post, Tag
from app.schemas.post import CategoryName, Lang, PostOut

LANGS = [lang.value for lang in Lang]
DEFAULT_LANG = Lang.EN.value
OG_LOCALES = {"en": "en_US", "es": "es_ES"}

# Share card for pages without an image of their own: frontend/public/og/default.jpg.
DEFAULT_IMAGE_PATH = "/og/default.jpg"
DEFAULT_IMAGE_SIZE = (864, 864)

TEXT = {
    "en": {
        "site_name": "Joaquín's Blog",
        "home_description": "My personal corner of the internet: honest writing about Python and backend engineering, my hobbies, and life in Albacete, Spain.",
        "about_title": "About me",
        "about_description": "Hey, I'm Joaquín: a senior backend engineer at Allot, building cybersecurity software at scale. By night, I point a telescope at the sky.",
        "category_description": "Posts about {category} on Joaquín's personal blog.",
        "tag_title": "Posts tagged {tag}",
        "tag_description": "Posts tagged #{tag} on Joaquín's personal blog.",
        # Crawlers' copy never shows the query: see page_head.
        "search_title": "Search",
        "post_not_found": "Post not found",
        "not_found_title": "Page not found",
        "not_found_description": "This page doesn't exist. Maybe the post was moved or deleted.",
        "default_image_alt": "Me in a white shirt, leaning on a stone railing in a park",
        "categories": {},
    },
    "es": {
        "site_name": "El blog de Joaquín",
        "home_description": "Mi rincón personal de internet: escribo con honestidad sobre Python e ingeniería backend, mis aficiones y la vida en Albacete.",
        "about_title": "Sobre mí",
        "about_description": "Hola, soy Joaquín: ingeniero backend sénior en Allot, donde construyo software de ciberseguridad a gran escala. Por la noche, apunto un telescopio al cielo.",
        "category_description": "Artículos sobre {category} en el blog personal de Joaquín.",
        "tag_title": "Artículos con la etiqueta {tag}",
        "tag_description": "Artículos con la etiqueta #{tag} en el blog personal de Joaquín.",
        "search_title": "Búsqueda",
        "post_not_found": "Artículo no encontrado",
        "not_found_title": "Página no encontrada",
        "not_found_description": "Esta página no existe. Puede que el artículo se haya movido o borrado.",
        "default_image_alt": "Yo con camisa blanca, apoyado en una barandilla de piedra en un parque",
        "categories": {
            "Engineering": "Ingeniería",
            "Hobbies": "Aficiones",
            "Personal Life": "Vida personal",
        },
    },
}

# Category pages exist for the fixed categories only: slug → stored (English) name.
_CATEGORY_BY_SLUG = {slugify(c.value): c.value for c in CategoryName}


def escape(text: str) -> str:
    """Safe in text and in double-quoted attributes. Apostrophes stay as they are:
    some link-preview parsers would show `&#x27;` literally."""
    return _escape(text, quote=False).replace('"', "&quot;")


def with_lang(lang: str, path: str) -> str:
    """`/posts/x` → `/es/posts/x`, and `/` → `/es`. Mirrors frontend/src/i18n/paths.ts."""
    return f"/{lang}" if path in ("", "/") else f"/{lang}{path}"


def site_url(path: str) -> str:
    return settings.site_url.rstrip("/") + path


@dataclass
class Head:
    """What a page tells search engines and share cards about itself."""

    # og:title. The <title> adds " – " and the site's name, except on the home page.
    title: str
    description: str
    # The page's language: the URL's, or English for paths without one.
    lang: str
    # The page's path without the language (`/`, `/about`, `/posts/x`).
    # Pages without one (search results, not found) aren't indexed.
    path: str | None = None
    # og:url: the page as it was asked for. Paths without a language keep
    # theirs, since they open in each reader's own language.
    url: str | None = None
    # Languages the page is published in.
    langs: list[str] = field(default_factory=lambda: list(LANGS))
    # Language of the title and description, when it isn't the page's.
    text_lang: str | None = None
    image: str | None = None
    image_alt: str = ""
    type: str = "website"
    noindex: bool = False
    published: datetime | None = None
    modified: datetime | None = None
    section: str = ""


def _one_line(text: str) -> str:
    return " ".join(text.split())


async def page_head(db: AsyncSession, path: str, api_url: str) -> Head:
    """The head of the public page at `path`. `api_url` resolves relative upload URLs.

    Only known pages and stored values make it into the head: nothing from the
    path itself is echoed back, so a made-up link can't put its own words on
    the site's share card.
    """
    parts = [part for part in path.split("/") if part]
    url_lang = parts.pop(0) if parts and parts[0] in LANGS else None
    lang = url_lang or DEFAULT_LANG
    text = TEXT[lang]
    here = site_url("/" + "/".join(([url_lang] if url_lang else []) + parts))

    def found(title: str, description: str, page: str, **kwargs) -> Head:
        return Head(title=title, description=description, lang=lang, path=page, url=here, **kwargs)

    def missing(title: str = text["not_found_title"]) -> Head:
        return Head(title=title, description=text["not_found_description"], lang=lang, noindex=True)

    if not parts:
        return found(text["site_name"], text["home_description"], "/")

    if parts == ["about"]:
        return found(text["about_title"], text["about_description"], "/about", type="profile")

    if parts == ["search"]:
        return Head(title=text["search_title"], description=text["home_description"], lang=lang, noindex=True)

    if len(parts) != 2:
        return missing()

    section, slug = parts

    if section == "categories":
        name = _CATEGORY_BY_SLUG.get(slug)
        if name is None:
            return missing()
        shown = text["categories"].get(name, name)
        return found(shown, text["category_description"].format(category=shown.lower()), f"/categories/{slug}")

    if section == "tags":
        name = (await db.execute(select(Tag.name).where(Tag.slug == slug))).scalar_one_or_none()
        if name is None:
            return missing()
        return found(text["tag_title"].format(tag=name), text["tag_description"].format(tag=name), f"/tags/{slug}")

    if section == "posts":
        result = await db.execute(
            select(Post)
            .where(Post.slug == slug)
            .options(selectinload(Post.tags), selectinload(Post.category), selectinload(Post.author))
        )
        post = result.scalar_one_or_none()
        if post is None:
            return missing(text["post_not_found"])
        # In this language, or in the original when it hasn't been translated.
        out = PostOut.from_orm_post(post, lang)
        cover = out.cover_image
        if cover and cover.startswith("/"):
            cover = api_url.rstrip("/") + cover
        return found(
            out.title,
            _one_line(out.excerpt) or text["home_description"],
            f"/posts/{out.slug}",
            langs=out.available_langs,
            text_lang=out.lang,
            image=cover or None,
            image_alt=out.title,
            type="article",
            noindex=out.draft,
            published=out.published_at,
            modified=out.updated_at,
            section=text["categories"].get(out.category, out.category),
        )

    return missing()


def render(head: Head) -> str:
    """The head's tags as HTML, marked `data-seo` so the app replaces them once it starts."""
    text_lang = head.text_lang or head.lang
    tags: list[str] = []

    def meta(key: str, value: str, attr: str = "property") -> None:
        tags.append(f'<meta {attr}="{key}" content="{escape(value)}" data-seo>')

    def link(rel: str, href: str, hreflang: str | None = None) -> None:
        lang_attr = f' hreflang="{hreflang}"' if hreflang else ""
        tags.append(f'<link rel="{rel}"{lang_attr} href="{escape(href)}" data-seo>')

    site_name = TEXT[head.lang]["site_name"]
    title = head.title if head.path == "/" else f"{head.title} – {site_name}"
    tags.append(f"<title>{escape(title)}</title>")
    meta("description", head.description, attr="name")
    if head.noindex:
        meta("robots", "noindex", attr="name")

    if head.path is not None and not head.noindex:
        def url(lang: str) -> str:
            return site_url(with_lang(lang, head.path))

        fallback = DEFAULT_LANG if DEFAULT_LANG in head.langs else head.langs[0]
        link("canonical", url(head.lang if head.lang in head.langs else fallback))
        if len(head.langs) > 1:
            for lang in head.langs:
                link("alternate", url(lang), hreflang=lang)
            link("alternate", url(fallback), hreflang="x-default")

    meta("og:site_name", site_name)
    meta("og:type", head.type)
    meta("og:title", head.title)
    meta("og:description", head.description)
    if head.path is not None and head.url:
        meta("og:url", head.url)
    meta("og:locale", OG_LOCALES[text_lang])
    for lang in head.langs:
        if lang != text_lang:
            meta("og:locale:alternate", OG_LOCALES[lang])

    if head.image:
        meta("og:image", head.image)
        meta("og:image:alt", head.image_alt)
    else:
        width, height = DEFAULT_IMAGE_SIZE
        meta("og:image", site_url(DEFAULT_IMAGE_PATH))
        meta("og:image:width", str(width))
        meta("og:image:height", str(height))
        meta("og:image:alt", TEXT[text_lang]["default_image_alt"])

    if head.type == "article":
        if head.published:
            meta("article:published_time", head.published.isoformat())
        if head.modified:
            meta("article:modified_time", head.modified.isoformat())
        if head.section:
            meta("article:section", head.section)

    meta("twitter:card", "summary_large_image" if head.image else "summary", attr="name")
    return "\n    ".join(tags) + "\n"


async def sitemap(db: AsyncSession) -> str:
    """Every public page in each of its languages, with hreflang links between them."""
    posts = await db.execute(
        select(
            Post.slug,
            Post.published_at,
            Post.updated_at,
            ((Post.title != "") & (Post.body != "")).label("has_en"),
            ((Post.title_es != "") & (Post.body_es != "")).label("has_es"),
        )
        .where(Post.draft.is_(False))
        .order_by(Post.published_at.desc())
    )
    categories = await db.execute(
        select(Category.slug)
        .join(Post, Post.category_id == Category.id)
        .where(Post.draft.is_(False))
        .distinct()
        .order_by(Category.slug)
    )

    # (path without language, languages, last modified)
    pages: list[tuple[str, list[str], datetime | None]] = [("/", LANGS, None), ("/about", LANGS, None)]
    pages += [(f"/categories/{slug}", LANGS, None) for slug in categories.scalars()]
    for row in posts:
        # Same rule as schemas.post.available_langs: published once it has a title and a body.
        langs = [lang for lang, ok in ((Lang.EN.value, row.has_en), (Lang.ES.value, row.has_es)) if ok]
        pages.append((f"/posts/{row.slug}", langs or [DEFAULT_LANG], row.updated_at or row.published_at))

    entries = []
    for path, langs, modified in pages:
        lastmod = f"<lastmod>{modified.date().isoformat()}</lastmod>" if modified else ""
        alternates = ""
        if len(langs) > 1:
            fallback = DEFAULT_LANG if DEFAULT_LANG in langs else langs[0]
            hreflangs = [(lang, lang) for lang in langs] + [("x-default", fallback)]
            alternates = "".join(
                f'<xhtml:link rel="alternate" hreflang="{hreflang}" href="{escape(site_url(with_lang(lang, path)))}"/>'
                for hreflang, lang in hreflangs
            )
        for lang in langs:
            entries.append(f"  <url><loc>{escape(site_url(with_lang(lang, path)))}</loc>{lastmod}{alternates}</url>")

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )
