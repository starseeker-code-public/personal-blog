from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _build_engine():
    url = settings.database_url
    kwargs: dict = {"echo": False, "pool_pre_ping": True}
    # asyncpg does not accept ?sslmode= as a URL parameter — translate it to connect_args.
    if "sslmode=require" in url:
        url = url.replace("?sslmode=require", "").replace("&sslmode=require", "")
        kwargs["connect_args"] = {"ssl": "require"}
    return create_async_engine(url, **kwargs)


engine = _build_engine()
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# create_all() creates missing tables but never adds columns to existing ones,
# so columns added after a database was first created are applied here.
# Every statement must be idempotent and additive: never drop or rewrite data.
_MIGRATIONS = [
    # Spanish translation of posts (English stays in title/excerpt/body).
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS title_es VARCHAR(500) NOT NULL DEFAULT ''",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt_es TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS body_es TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS read_time_minutes_es INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector_es TSVECTOR",
    "CREATE INDEX IF NOT EXISTS ix_posts_search_vector_es ON posts USING gin (search_vector_es)",
]


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for statement in _MIGRATIONS:
            await conn.execute(text(statement))
