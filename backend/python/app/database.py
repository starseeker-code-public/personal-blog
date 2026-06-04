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


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
