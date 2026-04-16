"""Seed script — run once to populate the database with sample data.

Usage (from backend/python/):
    python seed.py
"""

import asyncio
from datetime import datetime, timezone

from sqlalchemy import func, select

from app.database import AsyncSessionLocal, create_tables
from app.models.post import Author, Category, Post, Tag


SAMPLE_POSTS = [
    {
        "title": "Why I switched from Celery to asyncio queues for I/O-bound tasks",
        "excerpt": "After years of running Celery workers in production I found that asyncio queues — combined with a simple Redis broker — handle I/O-bound workloads with far less operational overhead.",
        "body": """## The problem with Celery for I/O-bound work

Celery is the default choice for background tasks in Django/Flask land, but it carries a heavy cost: worker processes, a separate broker (RabbitMQ or Redis), result backends, and a non-trivial ops surface.

For **I/O-bound** tasks — HTTP calls, database writes, file uploads — all that machinery is overkill.

## Enter asyncio queues

Python's `asyncio.Queue` is a thread-safe, in-process queue. Pair it with a few async worker coroutines and you get:

```python
import asyncio

queue: asyncio.Queue = asyncio.Queue()

async def worker(queue: asyncio.Queue) -> None:
    while True:
        task = await queue.get()
        await process(task)
        queue.task_done()

async def main() -> None:
    workers = [asyncio.create_task(worker(queue)) for _ in range(10)]
    await queue.join()
    for w in workers:
        w.cancel()
```

## When Celery still wins

- CPU-bound tasks (use `ProcessPoolExecutor` instead)
- Tasks that must survive process restarts (persist to DB or Redis Stream)
- Distributed task routing across multiple machines

## Conclusion

For a FastAPI service that needs background I/O work, asyncio queues give you 80% of Celery's value at 20% of the complexity. Profile first, choose deliberately.
""",
        "tags": ["python", "asyncio", "celery", "backend"],
        "category": "Python",
        "read_time_minutes": 8,
    },
    {
        "title": "PostgreSQL full-text search: a practical guide",
        "excerpt": "PostgreSQL's built-in tsvector/tsquery gives you relevance-ranked full-text search without Elasticsearch. Here's how to use it effectively.",
        "body": """## Why not Elasticsearch?

Elasticsearch is powerful but adds significant ops overhead. For most applications, PostgreSQL's full-text search is more than sufficient and is already in your stack.

## Core concepts

```sql
-- Convert text to a searchable vector
SELECT to_tsvector('english', 'FastAPI is a modern Python web framework');
-- 'fastapi':1 'framework':7 'modern':4 'python':5 'web':6

-- Create a query
SELECT plainto_tsquery('english', 'python framework');
-- 'python' & 'framework'

-- Match
SELECT to_tsvector('english', 'FastAPI is a modern Python web framework')
    @@ plainto_tsquery('english', 'python framework');
-- true
```

## Storing the search vector

For production, pre-compute and index it:

```sql
ALTER TABLE posts ADD COLUMN search_vector tsvector;

UPDATE posts SET search_vector =
    to_tsvector('english', title || ' ' || excerpt || ' ' || body);

CREATE INDEX ix_posts_search ON posts USING GIN(search_vector);
```

## Ranking results

```sql
SELECT title,
       ts_rank(search_vector, query) AS rank
FROM posts, plainto_tsquery('english', 'python asyncio') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

## Keeping it fresh

Use a trigger or a scheduled job (APScheduler works great) to update `search_vector` whenever a post changes.
""",
        "tags": ["postgresql", "search", "backend", "sql"],
        "category": "Backend",
        "read_time_minutes": 10,
    },
    {
        "title": "Redis caching strategies for FastAPI",
        "excerpt": "Caching is the difference between a fast API and a slow one. Here are three patterns that work well with FastAPI and Redis.",
        "body": """## Pattern 1 — Cache-aside (lazy loading)

The most common pattern: check the cache first, fetch from DB on miss, write to cache.

```python
async def get_post(slug: str, db: AsyncSession, redis: Redis) -> PostOut:
    cached = await redis.get(f"post:{slug}")
    if cached:
        return PostOut.model_validate_json(cached)

    post = await db.execute(select(Post).where(Post.slug == slug))
    result = PostOut.from_orm(post.scalar_one())
    await redis.setex(f"post:{slug}", 300, result.model_dump_json())
    return result
```

## Pattern 2 — Write-through

Update the cache on every write. Keeps data fresh but adds latency to writes.

## Pattern 3 — Background refresh

A scheduler (APScheduler) pre-warms cache before TTL expires. Zero cold-start penalty.

## Cache invalidation

The hard problem. Use a pattern-based delete:

```python
async def invalidate_post(slug: str, redis: Redis) -> None:
    cursor = 0
    while True:
        cursor, keys = await redis.scan(cursor, match="posts:list:*", count=100)
        if keys:
            await redis.delete(*keys)
        if cursor == 0:
            break
    await redis.delete(f"post:{slug}")
```

## Key naming conventions

- `posts:list:p1:s10:tag=None:cat=None` — paginated list
- `posts:slug:my-post-slug` — individual post
- `categories:all` — full category list

Always namespace by resource type for easy pattern-based invalidation.
""",
        "tags": ["redis", "fastapi", "caching", "python"],
        "category": "Backend",
        "read_time_minutes": 7,
    },
    {
        "title": "Docker Compose for local development: patterns that actually work",
        "excerpt": "After running Docker Compose setups across a dozen projects I've settled on a few patterns that make local dev fast, reproducible, and close to production.",
        "body": """## The service dependency graph

Always declare proper health-checks and `depends_on` conditions:

```yaml
services:
  backend:
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
```

Without `condition: service_healthy` your app starts before Postgres is ready and crashes on the first DB call.

## Separate dev and prod Dockerfiles

```
backend/
  Dockerfile          # production: multi-stage, no dev tools
  Dockerfile.dev      # development: mounts source, enables hot-reload
```

## Volume mounts for hot reload

```yaml
  backend:
    volumes:
      - ./backend:/app   # source mount
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment variables

Use `.env` for local values, never commit secrets:

```
# .env.example (commit this)
POSTGRES_PASSWORD=change-me

# .env (gitignored)
POSTGRES_PASSWORD=my-local-secret
```

## Named volumes for persistence

```yaml
volumes:
  postgres_data:   # survives container restarts
  redis_data:
```

Without named volumes your database is wiped on every `docker compose down`.
""",
        "tags": ["docker", "devops", "local-dev"],
        "category": "DevOps",
        "read_time_minutes": 6,
    },
    {
        "title": "Building this blog: FastAPI + React, the decisions behind it",
        "excerpt": "Every technical project is a series of tradeoffs. Here's why I chose FastAPI, PostgreSQL, Redis, and React for this blog — and what I'd change if I started over.",
        "body": """## Why FastAPI?

Three reasons:
1. **Async first** — plays well with asyncpg and Redis without threads
2. **Auto-generated docs** — `/docs` just works
3. **Pydantic v2** — fast, strict, great DX

Flask is fine but its sync-by-default model means thread pools and more workers for the same I/O throughput.

## Why PostgreSQL over MongoDB?

Blog posts have a clear schema. Postgres gives us:
- Full-text search (no Elasticsearch needed)
- ACID transactions
- Proper foreign keys for tags/categories
- JSON columns if we ever need schema flexibility

## Why Redis?

Two jobs:
1. **Cache** — avoid hitting Postgres for every `GET /api/posts`
2. **Pub/sub** (future) — live comment notifications

## Why React + Vite?

The portfolio is already on this stack. Consistency over novelty.

## What I'd change

- **SSR / SSG** — a React SPA hurts SEO for a blog. `vite-plugin-ssg` or Next.js would be better for production.
- **Full-text search** — for >100k posts, Meilisearch or Typesense beats PostgreSQL's tsvector.
""",
        "tags": ["fastapi", "react", "postgresql", "redis", "architecture"],
        "category": "Python",
        "read_time_minutes": 9,
    },
]


async def seed() -> None:
    await create_tables()

    async with AsyncSessionLocal() as db:
        # Skip if already seeded
        count = await db.execute(select(func.count(Post.id)))
        if count.scalar_one() > 0:
            print("Database already has posts — skipping seed.")
            return

        print("Seeding database…")

        # Author
        author = Author(
            name="Joaquín Hernández Martínez",
            bio="Python backend engineer. I write about what I build.",
            email="proyecto_noether@outlook.com",
            github="https://github.com/starseeker-code-public",
        )
        db.add(author)
        await db.flush()

        # Categories cache
        categories: dict[str, Category] = {}
        # Tags cache
        tags: dict[str, Tag] = {}

        def get_or_make_category(name: str) -> Category:
            from slugify import slugify
            slug = slugify(name)
            if slug not in categories:
                c = Category(slug=slug, name=name)
                db.add(c)
                categories[slug] = c
            return categories[slug]

        def get_or_make_tag(name: str) -> Tag:
            from slugify import slugify
            slug = slugify(name)
            if slug not in tags:
                t = Tag(slug=slug, name=name)
                db.add(t)
                tags[slug] = t
            return tags[slug]

        await db.flush()

        for i, data in enumerate(SAMPLE_POSTS):
            from slugify import slugify

            post = Post(
                slug=slugify(data["title"]),
                title=data["title"],
                excerpt=data["excerpt"],
                body=data["body"],
                read_time_minutes=data["read_time_minutes"],
                published_at=datetime.now(timezone.utc),
                draft=False,
                author=author,
                category=get_or_make_category(data["category"]),
            )
            await db.flush()
            post.tags = [get_or_make_tag(t) for t in data["tags"]]
            db.add(post)

        await db.commit()
        print(f"Seeded {len(SAMPLE_POSTS)} posts, author, categories, and tags.")


if __name__ == "__main__":
    asyncio.run(seed())
