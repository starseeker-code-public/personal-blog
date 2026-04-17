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
    # ── Engineering ─────────────────────────────────────────────────────────
    {
        "title": "Why I switched from Celery to asyncio queues for I/O-bound tasks",
        "excerpt": "After years of running Celery workers in production I found that asyncio queues — combined with a simple Redis broker — handle I/O-bound workloads with far less operational overhead.",
        "body": """## The problem with Celery for I/O-bound work

Celery is the default choice for background tasks in Django/Flask land, but it carries a heavy cost: worker processes, a separate broker, result backends, and a non-trivial ops surface.

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
- Tasks that must survive process restarts (persist to Redis Stream)
- Distributed task routing across multiple machines

## Conclusion

For a FastAPI service that needs background I/O work, asyncio queues give you 80% of Celery's value at 20% of the complexity. Profile first, choose deliberately.
""",
        "tags": ["python", "asyncio", "backend"],
        "category": "Engineering",
        "read_time_minutes": 8,
    },
    {
        "title": "PostgreSQL full-text search without Elasticsearch",
        "excerpt": "PostgreSQL's built-in tsvector/tsquery gives you relevance-ranked full-text search without the operational overhead of a separate search cluster. Here's how to use it in production.",
        "body": """## Why not Elasticsearch?

Elasticsearch is powerful but adds significant ops overhead: a separate cluster to manage, JVM tuning, index mapping decisions. For most applications, PostgreSQL's full-text search is more than sufficient.

## Core concepts

```sql
-- Convert text to a searchable vector
SELECT to_tsvector('english', 'FastAPI is a modern Python web framework');

-- Create a query
SELECT plainto_tsquery('english', 'python framework');

-- Match
SELECT to_tsvector('english', 'FastAPI is a modern Python web framework')
    @@ plainto_tsquery('english', 'python framework');
-- true
```

## Storing and indexing

For production, pre-compute and index the vector:

```sql
ALTER TABLE posts ADD COLUMN search_vector tsvector;

UPDATE posts SET search_vector =
    to_tsvector('english', title || ' ' || excerpt || ' ' || body);

CREATE INDEX ix_posts_search ON posts USING GIN(search_vector);
```

## Ranking results

```sql
SELECT title, ts_rank(search_vector, query) AS rank
FROM posts, plainto_tsquery('english', 'python asyncio') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

## Keeping it fresh

Use APScheduler to rebuild search vectors every few minutes:

```python
async def update_search_vectors(db: AsyncSession) -> None:
    await db.execute(text(
        "UPDATE posts SET search_vector = "
        "to_tsvector('english', title || ' ' || coalesce(excerpt,'') || ' ' || body)"
    ))
    await db.commit()
```

This is what powers the search on this blog.
""",
        "tags": ["postgresql", "search", "backend", "sql"],
        "category": "Engineering",
        "read_time_minutes": 10,
    },
    # ── Hobbies ─────────────────────────────────────────────────────────────
    {
        "title": "My first year as an amateur astronomer",
        "excerpt": "What happens when a backend engineer turns a telescope toward the sky. Objects found, mistakes made, and why programming and astronomy are more alike than I expected.",
        "body": """## How it started

It's embarrassing to admit, but the telescope sat in its box for two months after I bought it. Setting up a Dobsonian reflector looked like assembling IKEA furniture with extra steps, and I kept telling myself I'd do it "when I had a clear night and enough time."

Eventually a Friday night arrived with no clouds and no excuses.

## The first objects

My first successful observation was the Moon, which feels anticlimactic until you actually look. The terminator — the boundary between lunar day and night — throws craters into sharp relief. I spent two hours on it and forgot I had work on Monday.

Jupiter was next. You can see the four Galilean moons with almost any telescope. When you first spot them, you understand viscerally why Galileo was convinced the Earth wasn't the centre of everything.

## What I've learned

- **Collimation matters more than aperture.** A well-aligned 6" beats a poorly-aligned 10" every time.
- **Dark adaptation is real.** Your eyes need 20–30 minutes to fully adjust. Don't check your phone.
- **Star-hopping is underrated.** GoTo mounts are convenient, but learning to navigate by star patterns teaches you the sky in a way automation never will.
- **Manage your expectations.** Deep-sky objects look nothing like Hubble photos. Most galaxies are a faint smudge. That smudge is two hundred billion suns. Both things are true simultaneously.

## The programming overlap

There's more overlap than I expected. Astronomy is a hobby with near-infinite depth — the same feeling you get going down a distributed systems rabbit hole. And there's something satisfying about working with data that has been traveling through space for millions of years before reaching your eye.

More posts on specific targets, equipment, and the occasional astrophoto to follow.
""",
        "tags": ["astronomy", "hobbies", "learning"],
        "category": "Hobbies",
        "read_time_minutes": 7,
    },
    {
        "title": "Competitive coding made me a better engineer",
        "excerpt": "I've been solving Codewars katas for three years. Here's what daily algorithmic practice taught me that years of professional development didn't.",
        "body": """## Three years of kata practice

I started solving Codewars katas to prepare for technical interviews. I stayed because I genuinely enjoy it.

Three years in, I'm at 3 kyu — the top ~5% of users. More importantly, I'm a noticeably different engineer than when I started.

## What kata practice actually teaches

### Thinking before writing

A kata forces you to understand the problem fully before touching the keyboard. Real-world code reviewers appreciate this more than you'd expect.

### Recognising patterns

After a hundred problems you start seeing that most reduce to a handful of patterns: sliding window, two pointers, dynamic programming, graph traversal. This transfers directly to API design and data pipeline work.

### Python fluency

```python
# Before kata practice, I'd write:
result = []
for item in items:
    if condition(item):
        result.append(transform(item))

# After:
result = [transform(item) for item in items if condition(item)]

# And know when the first is actually clearer.
```

### Humility

You will be outperformed by someone's elegant one-liner. That's fine. Understanding *why* it works is the whole point.

## The limits

Kata practice won't teach you system design, stakeholder communication, or how to disagree with a product manager. It's one tool.

But for sharpening the pure problem-solving instinct — the muscle that figures out *how* before worrying about *what* — nothing I've found works better.
""",
        "tags": ["codewars", "algorithms", "python", "hobbies"],
        "category": "Hobbies",
        "read_time_minutes": 6,
    },
    # ── Personal Life ────────────────────────────────────────────────────────
    {
        "title": "On working remotely from Albacete, Spain",
        "excerpt": "Most remote work advice assumes you're escaping a major city. Here's what it's actually like to work as a senior engineer from a mid-sized Spanish city — including the surprising advantages.",
        "body": """## The default assumption

Most remote work content assumes you're escaping London or San Francisco to live cheaply elsewhere while billing at big-city rates. The classic geoarbitrage narrative.

I'm not doing that. I'm from Albacete. I've always been from Albacete. Working remotely as a senior engineer from here is a different thing entirely.

## The practical reality

Internet in Spain is genuinely excellent. FTTH coverage is better here than in most western European countries. My connection is 600 Mbps symmetric for €30/month.

The salary gap with Madrid is closing. Senior backend roles now pay within 15–20% of Madrid rates fully remotely, and the cost of living difference more than compensates.

## The honest part

Albacete doesn't have a tech scene. There are no meetups, no co-working spaces with startup energy, no serendipitous conversations with other engineers at a coffee shop.

You build that deliberately — online communities, occasional trips for conferences, and being genuinely good at async written communication so you feel present in your team even from a distance.

## What I've gained

Time. The commute is zero. I walk to a café when I want a change of scenery. I observe from a dark-sky site 40 minutes away on clear nights.

The option to go into nature on a Tuesday afternoon and make the time up in the evening. This is not something Madrid gives you.

## What I'd tell myself earlier

Build the online community deliberately. Invest in your home setup like it's an office — because it is. Go to at least one in-person conference per year to remember that your colleagues are real humans.

The rest takes care of itself.
""",
        "tags": ["remote-work", "life", "spain"],
        "category": "Personal Life",
        "read_time_minutes": 5,
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
            bio="Senior Python backend engineer. Amateur astronomer. Writing about engineering, hobbies, and life from Albacete, Spain.",
            email="proyecto_noether@outlook.com",
            github="https://github.com/starseeker-code-public",
        )
        db.add(author)
        await db.flush()

        categories: dict[str, Category] = {}
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

        for data in SAMPLE_POSTS:
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
        print(f"Seeded {len(SAMPLE_POSTS)} posts across Engineering, Hobbies, and Personal Life.")


if __name__ == "__main__":
    asyncio.run(seed())
