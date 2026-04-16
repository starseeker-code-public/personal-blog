import json
from typing import Any

from app.config import settings
from app.redis_client import get_redis


async def cache_get(key: str) -> Any | None:
    redis = await get_redis()
    raw = await redis.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def cache_set(key: str, value: Any, ttl: int | None = None) -> None:
    redis = await get_redis()
    await redis.setex(key, ttl or settings.cache_ttl, json.dumps(value, default=str))


async def cache_delete(key: str) -> None:
    redis = await get_redis()
    await redis.delete(key)


async def cache_delete_pattern(pattern: str) -> None:
    """Delete all keys matching a glob pattern (e.g. 'posts:list:*')."""
    redis = await get_redis()
    cursor = 0
    while True:
        cursor, keys = await redis.scan(cursor, match=pattern, count=100)
        if keys:
            await redis.delete(*keys)
        if cursor == 0:
            break
