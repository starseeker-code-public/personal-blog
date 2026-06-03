# Personal Blog

<p align="center">
  <em>A personal blog and writing platform — FastAPI backend, React frontend.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.12+-blue?style=for-the-badge" alt="Python">
  <img src="https://img.shields.io/badge/fastapi-0.115+-009688?style=for-the-badge" alt="FastAPI">
  <img src="https://img.shields.io/badge/react-18-61DAFB?style=for-the-badge" alt="React">
  <img src="https://img.shields.io/badge/postgresql-16-336791?style=for-the-badge" alt="PostgreSQL">
</p>

---

A proof-of-concept personal blog built to explore the FastAPI + React stack. Styled to match a personal portfolio — same dark midnight-blue/violet palette, gold accents, Tomorrow/Anta/Exo 2 fonts, and Tailwind conventions. Posts are written in Markdown, served through a cached REST API, and rendered with full syntax highlighting and GFM support.

### Project Status

| Environment | URL | Notes |
|-------------|-----|-------|
| **Development** | `http://localhost:3001` | Local Docker Compose |
| **Production** | *(not yet deployed)* | Planned |

| Commit | Date | Description |
|--------|------|-------------|
| `db1a61c` | 2026-04-17 | Finished final styling and sample content |
| `f71a91a` | 2026-04-17 | Made a better light mode and fixed some styling |
| `9191ad1` | 2026-04-16 | Improved light mode |

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Development & Docker](#development--docker)
  - [Quick Start](#quick-start)
  - [Running locally (without Docker)](#running-locally-without-docker)
- [Project Structure & Architecture](#project-structure--architecture)
  - [Architecture Overview](#architecture-overview)
  - [Data Flow](#data-flow)
  - [Directory Layout](#directory-layout)
  - [Design Decisions](#design-decisions)
- [Features](#features)
  - [Backend](#backend-features)
  - [Frontend](#frontend-features)
  - [Pages](#pages)
- [Post wire format](#post-wire-format)
  - [GET response shape — `Post`](#get-response-shape--post)
  - [Example response payload](#example-response-payload)
  - [POST request shape — `PostCreate`](#post-request-shape--postcreate)
  - [Example create request](#example-create-request)
  - [TypeScript interfaces](#typescript-interfaces)
  - [Pull vs push — two delivery philosophies](#pull-vs-push--two-delivery-philosophies)
  - [Feed endpoints](#feed-endpoints)
- [API Reference](#api-reference)
- [Security](#security)
- [CI/CD](#cicd)
- [Deploying to Koyeb](#deploying-to-koyeb)
- [License](#license)

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.12+ | Runtime |
| FastAPI | 0.115+ | Web framework |
| SQLAlchemy | 2.x (async) | ORM — async engine + session factory |
| Pydantic | v2 | Request/response models (camelCase on wire) |
| PostgreSQL | 16 (Alpine) | Primary database |
| Redis | 7 (Alpine) | Response cache |
| APScheduler | 3.x | Background job scheduler |
| Uvicorn | latest | ASGI server |

### Frontend

| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS + `@tailwindcss/typography` | Styling |
| React Markdown + remark-gfm | Markdown rendering with GFM |
| rehype-highlight + highlight.js | Syntax highlighting in code blocks |
| React Router | Client-side routing |

### Infrastructure & Deployment

| Technology | Purpose |
|-----------|---------|
| Docker | Multi-stage builds — Node → Nginx (frontend), Python (backend) |
| Docker Compose | Service orchestration (PostgreSQL + Redis + backend + frontend) |
| Nginx | SPA fallback routing in production frontend container |

### Python Dependencies

| Package | Purpose |
|---------|---------|
| `asyncpg` | Async PostgreSQL driver |
| `aioredis` / `redis[asyncio]` | Async Redis client (singleton) |
| `feedgen` | RSS/Atom feed generation |
| `python-slugify` | Slug generation from post titles |
| `python-dotenv` | Environment variable loading |
| `httpx` | HTTP client for external calls |

---

## Database Schema

### ER Diagram

```mermaid
erDiagram
    Author {
        int id PK
        string name
        string bio
        string avatar_url
    }

    Category {
        int id PK
        string name
        string slug UK
        text description
    }

    Tag {
        int id PK
        string name
        string slug UK
    }

    Post {
        int id PK
        string title
        string slug UK
        text excerpt
        text body
        tsvector search_vector
        int read_time
        bool draft
        datetime published_at
        datetime created_at
        datetime updated_at
        int author_id FK
        int category_id FK
    }

    PostTag {
        int id PK
        int post_id FK
        int tag_id FK
    }

    Author ||--o{ Post : "writes"
    Category ||--o{ Post : "contains"
    Post }o--o{ Tag : "tagged with"
    Post ||--o{ PostTag : ""
    Tag ||--o{ PostTag : ""
```

### Key Constraints

| Constraint | Model | Rule |
|-----------|-------|------|
| Unique | `Post.slug` | Derived from title, collision-handled |
| Unique | `Category.slug`, `Tag.slug` | Auto-generated |
| Unique pair | `PostTag` | `(post_id, tag_id)` |
| Auto-computed | `Post.read_time` | Derived from word count on save |
| Auto-indexed | `Post.search_vector` | GIN index, rebuilt by background job |

---

## Development & Docker

### Quick Start

```bash
# Clone
git clone <repo-url>
cd personal-blog
```

**Docker (recommended):**

```bash
# Build and start all services (PostgreSQL, Redis, backend, frontend)
docker compose up --build

# Open the blog
open http://localhost:3001

# Open the interactive API docs
open http://localhost:8001/docs
```

### Running locally (without Docker)

**Backend:**

```bash
cd backend/python

python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# No per-app .env needed — the backend resolves the root .env from its own path.
# Make sure PostgreSQL and Redis are reachable at the URLs in the root .env
# (defaults assume Docker Compose is running with its published ports).

uvicorn app.main:app --reload   # http://localhost:8001
```

**Frontend:**

```bash
cd frontend

npm install

# Vite reads VITE_API_BASE from the root .env (envDir: '..').
npm run dev   # http://localhost:5173
```

---

## Project Structure & Architecture

### Architecture Overview

```mermaid
graph TB
    Browser[Browser] --> Frontend[React / Nginx :3001]
    Frontend --> Backend[FastAPI / Uvicorn :8001]
    Backend --> PG[(PostgreSQL :5433)]
    Backend --> Redis[(Redis :6380)]
    Backend --> APScheduler[APScheduler]
    APScheduler --> PG
    APScheduler --> Redis

    subgraph "FastAPI Routers"
        Posts["/api/posts"]
        Categories["/api/categories"]
        Tags["/api/tags"]
        Search["/api/search"]
        Health["/health"]
        Feed["/feed.xml"]
        Sitemap["/sitemap.xml"]
    end
```

### Data Flow

```text
Browser → React fetch → FastAPI router
                              ↓
                        Redis cache hit? → return JSON
                              ↓ miss
                        PostgreSQL query (async SQLAlchemy)
                              ↓
                        Pydantic serialisation (camelCase)
                              ↓
                        Write to Redis cache
                              ↓
                        Return JSON to browser
```

On writes (`POST`, `PUT`, `DELETE`), relevant Redis keys are invalidated immediately so the next read fetches fresh data.

**Background jobs (APScheduler):**

| Schedule | Job |
|----------|-----|
| Every 5 min | Rebuild `search_vector` (tsvector) for new/modified posts |
| Every hour | Regenerate `/feed.xml` (Atom/RSS via feedgen) |
| Every hour | Warm Redis cache (re-fetch top posts) |

### Directory Layout

```text
personal-blog/
├── docker-compose.yml          # Orchestrates all services
├── .env                        # Single root env file (gitignored) — read by Docker, backend, and frontend
│
├── backend/
│   └── python/                 # FastAPI implementation
│       │                       # (add go/, rust/, etc. alongside for other languages)
│       ├── app/
│       │   ├── main.py         # App factory, CORS, startup/shutdown lifecycle
│       │   ├── config.py       # Settings loaded from environment variables
│       │   ├── database.py     # Async SQLAlchemy engine and session factory
│       │   ├── redis_client.py # Async Redis client (singleton)
│       │   │
│       │   ├── models/
│       │   │   └── post.py     # SQLAlchemy ORM: Author, Category, Tag, Post
│       │   │
│       │   ├── schemas/
│       │   │   └── post.py     # Pydantic v2 request/response models (camelCase on wire)
│       │   │
│       │   ├── routers/
│       │   │   ├── posts.py    # CRUD endpoints for posts
│       │   │   ├── categories.py
│       │   │   ├── tags.py
│       │   │   ├── search.py   # Full-text search
│       │   │   └── health.py   # DB + Redis health check
│       │   │
│       │   └── services/
│       │       ├── cache.py    # Redis get/set/delete helpers
│       │       └── scheduler.py # APScheduler background jobs
│       │
│       ├── requirements.txt
│       └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── types/index.ts      # TypeScript interfaces (Post, Category, Tag, ...)
    │   ├── data/index.ts       # API client + SITE constants
    │   ├── utils/slugify.ts
    │   │
    │   ├── components/
    │   │   ├── icons/          # SVG icons as React components (no icon library)
    │   │   ├── layout/         # Navbar (with search), Footer
    │   │   └── ui/             # Section, PostCard, Prose, Pagination, Tag, Stars, ...
    │   │
    │   ├── sections/           # Page-level composition blocks
    │   │   ├── Hero.tsx        # Landing hero with Typewriter + RoleRotator
    │   │   ├── FeaturedPosts.tsx
    │   │   ├── RecentPosts.tsx
    │   │   └── CategoryList.tsx
    │   │
    │   └── pages/              # One file per route
    │       ├── Home.tsx
    │       ├── Post.tsx        # Single post with reading progress bar
    │       ├── Category.tsx
    │       ├── About.tsx
    │       ├── Search.tsx
    │       └── NotFound.tsx
    │
    ├── tailwind.config.js      # Includes @tailwindcss/typography
    ├── nginx.conf              # SPA fallback for production
    └── Dockerfile              # Multi-stage: Node build → Nginx serve
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Async FastAPI | All I/O is async — DB queries (asyncpg), Redis reads, feed generation. No blocking the event loop. |
| Redis caching | List and detail endpoints are read-heavy. Caching with pattern-based invalidation on writes avoids repeated DB hits. |
| PostgreSQL full-text search | `tsvector` + GIN index gives relevance-ranked search without adding Elasticsearch to the stack. |
| Pydantic v2 + camelCase | camelCase aliases on all response models so React can consume them directly without name-mangling. |
| APScheduler inside the app | Simpler than adding Celery + broker for a personal project. Rebuilds search vectors and warms cache on a schedule. |
| No icon library | SVG icons are inlined as React components — zero runtime dependency and full control over stroke widths and sizing. |
| Tailwind typography plugin | `@tailwindcss/typography` handles Markdown-rendered prose styling (headings, code, blockquotes) without custom CSS. |
| Multi-language backend dir | `backend/python/` is the first implementation. `backend/go/` and `backend/rust/` can sit alongside it; switching requires only one line in `docker-compose.yml`. |

---

## Features

### Backend Features

- **Full CRUD API** — create, read, update, and delete blog posts via REST
- **PostgreSQL full-text search** — `tsvector` + GIN index for fast relevance-ranked search; no Elasticsearch needed
- **Redis caching** — `GET /api/posts` and `GET /api/posts/{slug}` cached with automatic pattern-based invalidation on writes
- **APScheduler background jobs**:
  - Every 5 minutes: rebuilds `search_vector` for new/modified posts
  - Every hour: generates `/feed.xml` (Atom/RSS feed via feedgen)
  - Every hour: warms the Redis cache
- **RSS feed** — served at `/feed.xml`, regenerated hourly
- **Sitemap** — served at `/sitemap.xml`, generated on request
- **Tag and category filtering** — `GET /api/posts?tag=redis&category=backend`
- **Pagination** — `GET /api/posts?page=2&pageSize=10`
- **Auto slug generation** — derived from the post title with collision handling
- **Auto read-time calculation** — computed from word count on save
- **Health endpoint** — `GET /health` reports DB and Redis status
- **CORS** — configured for the frontend origin via environment variable
- **Interactive API docs** — Swagger UI at `/docs`, ReDoc at `/redoc`

### Frontend Features

- **Matching portfolio palette** — midnight blue/violet surfaces (`slate-950`), gold + violet accents, Tomorrow/Anta/Exo 2 fonts, CSS keyframe animations
- **Dark and light mode** — full theme toggle persisted across sessions; both modes polished
- **Reading progress bar** — thin gradient bar at the top of each post page
- **Markdown rendering** — posts stored and rendered as Markdown with GitHub Flavored Markdown support (`remark-gfm`)
- **Syntax highlighting** — code blocks rendered with `rehype-highlight` + `highlight.js` using a dark theme
- **Inline search** — search input in the Navbar, navigates to `/search?q=...`
- **Category pages** — `/categories/:slug` lists all posts in a category
- **Pagination** — client-driven, calls the paginated API
- **Skeleton loading states** — animated placeholders while fetching
- **Author card** — shown at the bottom of each post when author data is present
- **RSS link** — in the footer, pointing to `/feed.xml` on the backend
- **Star rating display** — decorative star component used across post cards

### Pages

#### Home

The landing page. Shows the blog's hero section and a snapshot of content:

- **Hero** — animated typewriter effect with rotating role/title text
- **Featured posts** — editorially selected posts shown with large cards
- **Recent posts** — latest published posts in chronological order
- **Category list** — all categories with post counts, linking to their pages

#### Post (`/posts/:slug`)

The single-post reading experience:

- **Reading progress bar** — thin gradient bar at the top of the viewport, fills as you scroll
- **Rendered Markdown** — full GFM: tables, task lists, footnotes, strikethrough
- **Syntax highlighting** — fenced code blocks highlighted by language
- **Author card** — avatar, name, and bio rendered below the post body
- **Tags** — tag pills linking to their respective tag pages

#### Category (`/categories/:slug`)

Lists all posts belonging to a category, paginated. Same PostCard layout as the home page.

#### About

A personal "about me" page. Static content describing the author, background, and what the blog covers. Styled as a Markdown prose section.

#### Search (`/search?q=...`)

Full-text search page. Query is passed to `GET /api/search?q=...` which runs the PostgreSQL `tsvector` search and returns relevance-ranked results. Skeleton states shown while loading.

#### Not Found

Custom 404 page with navigation back to home.

---

## Post wire format

This is the canonical JSON shape of a blog post as exposed over the REST API. It is **the same shape across every endpoint that returns a post** — single post, list items, feed items, and the publish webhook payload. Any frontend (this project's React app or any third-party consumer) should align against this contract.

All fields are serialised in **camelCase** on the wire (Pydantic v2 `alias_generator=to_camel`). Dates are ISO 8601 with timezone (UTC).

### GET response shape — `Post`

Every endpoint that returns a post — `GET /api/posts`, `GET /api/posts/{slug}`, `GET /api/feed`, `POST /api/feed/webhook` — serialises the **same** `Post` object. Align against this shape and your consumer works against all four.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `slug` | `string` | no | URL-safe unique identifier. Derived from the title, collision-handled by suffix. |
| `title` | `string` | no | Post title as written by the author. |
| `excerpt` | `string` | no | Short summary (plain text, typically 1-3 sentences). May be empty. |
| `body` | `string` | no | Full post body in Markdown with GFM (tables, task lists, footnotes, strikethrough, fenced code blocks). Bare URLs (`https://…`, `www.…`) are auto-linked by the renderer. Inline image syntax `![alt](url)` is intentionally **not** rendered — it would fight the floated cover image in the post layout. |
| `publishedAt` | `string` (ISO 8601) | no | Publication timestamp in UTC. Used for ordering in the feed. |
| `updatedAt` | `string` (ISO 8601) | yes | Last edit timestamp in UTC. `null` if the post has never been edited since publication. |
| `readTimeMinutes` | `integer` | no | Estimated read time in whole minutes. Computed from word count on save (≈200 wpm, floor of 1). |
| `coverImage` | `string` | yes | Either an absolute URL (`https://…`) or a relative path (`/uploads/<filename>`) served by this backend. Clients should resolve relative paths against the API base. Every post on this blog has a cover image; `null` is only possible for legacy rows. |
| `draft` | `boolean` | no | `true` for drafts (excluded from all public endpoints), `false` for published posts. |
| `tags` | `string[]` | no | Array of tag names drawn from a fixed, category-scoped catalogue. Empty array if untagged. Order is insertion-stable but not semantically meaningful. The blog collapses anything past the first 5 behind a "…" chip. |
| `category` | `string` | no | One of `"Engineering"`, `"Hobbies"`, `"Personal Life"`, or `""` when uncategorised. A post belongs to at most one category and the enum is enforced by the backend. |
| `author` | `object \| null` | yes | Author object (see below). `null` when no author is attached; consumers should fall back to a site-level default. |
| `author.name` | `string` | no | Author's display name. |
| `author.avatar` | `string` (URL) | yes | Absolute URL to the author's avatar image. |
| `author.bio` | `string` | yes | Short author bio (plain text). |
| `author.socials` | `object \| null` | yes | Map of social-platform → handle/URL. Known keys: `github`, `linkedin`, `twitter`, `email`. Absent keys mean "no link". `null` when the author has no socials. |

### Example response payload

```json
{
  "slug": "async-fastapi-with-sqlalchemy-2-0",
  "title": "Async FastAPI with SQLAlchemy 2.0",
  "excerpt": "FastAPI is async top to bottom. Your database layer had better be too — SQLAlchemy 2.0 makes that painless.",
  "body": "# Async FastAPI with SQLAlchemy 2.0\n\nFastAPI is async top to bottom...\n\n## Engine and session\n\n```python\nfrom sqlalchemy.ext.asyncio import create_async_engine\n```\n\nRead more at https://docs.sqlalchemy.org/en/20/ or www.pydantic.dev.",
  "publishedAt": "2026-04-17T12:00:00+00:00",
  "updatedAt": null,
  "readTimeMinutes": 4,
  "coverImage": "/uploads/14c0f04d38c6c9ce7e3b6924.jpg",
  "draft": false,
  "tags": ["python", "backend", "api-design", "performance"],
  "category": "Engineering",
  "author": null
}
```

### POST request shape — `PostCreate`

`POST /api/posts` accepts a `PostCreate` body. Field names are camelCase on the wire; the backend also accepts the underlying snake_case names for interoperability.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | `string` | **yes** | — | Post title. Also the basis for the auto-generated slug. |
| `body` | `string` | yes (in practice) | `""` | Post body in Markdown (GFM). Stored as-is; rendered by the frontend. |
| `excerpt` | `string` | no | `""` | Short summary. Used in list cards and meta tags. |
| `coverImage` | `string` | no | `null` | Absolute URL or a backend-relative `/uploads/<filename>` path. The blog UI requires one before publish. |
| `draft` | `boolean` | no | `false` | `true` hides the post from every public endpoint. |
| `tags` | `string[]` | no | `[]` | Tag names. Drawn from the category's catalogue on the blog UI; the API itself does not enforce membership. |
| `category` | `"Engineering" \| "Hobbies" \| "Personal Life" \| null` | no | `null` | Enum-validated by the backend — any other value returns `422`. |
| `publishedAt` | `string` (ISO 8601) | no | server time | Override the publish timestamp. |

**Responses:**

| Status | When |
|--------|------|
| `201` | Created. Body is the full `Post` (same shape as GET). |
| `422` | Validation error — typically `category` outside the enum, or a missing required field. |

### Example create request

```bash
curl -X POST http://localhost:8001/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Async FastAPI with SQLAlchemy 2.0",
    "excerpt": "A practical walkthrough of wiring async sessions into a FastAPI app.",
    "body": "# Hello\n\nPost body in **Markdown**.",
    "category": "Engineering",
    "tags": ["python", "backend", "api-design"],
    "coverImage": "/uploads/14c0f04d38c6c9ce7e3b6924.jpg",
    "draft": false
  }'
```

The response is the full `Post` object, and the post is immediately reachable at `/posts/<generated-slug>` on the frontend.

### TypeScript interfaces

Drop these straight into any TypeScript consumer to stay aligned with the contract:

```ts
export type PostCategory = 'Engineering' | 'Hobbies' | 'Personal Life'

export interface Author {
  name: string
  avatar: string | null
  bio: string | null
  socials: {
    github?: string
    linkedin?: string
    twitter?: string
    email?: string
  } | null
}

// GET response shape — returned by every post-serving endpoint.
export interface Post {
  slug: string
  title: string
  excerpt: string
  body: string                      // Markdown (GFM); inline ![]() is dropped
  publishedAt: string               // ISO 8601 UTC
  updatedAt: string | null          // ISO 8601 UTC
  readTimeMinutes: number
  coverImage: string | null         // absolute URL or "/uploads/<filename>"
  draft: boolean
  tags: string[]
  category: PostCategory | ''
  author: Author | null
}

// POST request body — omitted fields fall back to their defaults.
export interface PostCreate {
  title: string
  body: string
  excerpt?: string
  coverImage?: string
  draft?: boolean
  tags?: string[]
  category?: PostCategory
  publishedAt?: string
}

// Feed pagination envelope (returned by GET /api/feed).
export interface FeedPage {
  items: Post[]
  page: number                      // 1-indexed
  pageSize: number                  // always 3
  totalPages: number                // 1–3
  totalPosts: number                // 0–9
  hasNext: boolean
  hasPrev: boolean
}
```

### Pull vs push — two delivery philosophies

The blog exposes two shapes of delivery for the same canonical `Post` payload. They are deliberately complementary — each covers a weakness of the other.

```text
                     ┌───────────────────────────────────────────┐
                     │           Blog backend (origin)           │
                     └───────────────────────────────────────────┘
                          ▲                            │
                          │  GET /api/feed             │  POST /api/feed/webhook
                          │  (consumer asks)           │  (origin notifies)
                          │                            ▼
                     ┌──────────┐                 ┌──────────┐
                     │ Consumer │                 │ Consumer │
                     │   PULL   │                 │   PUSH   │
                     └──────────┘                 └──────────┘
```

**`GET /api/feed` — pull model.** The consumer decides when to fetch. The server is passive and simply answers whoever asks. This is the web's default shape: cacheable, idempotent, safe to retry, trivial to debug with `curl`. The cost is latency and freshness — the consumer only sees a new post when it next polls, so there's always a lag (up to the polling interval) and a lot of wasted requests when nothing has changed. Pull is the right default when:

- The consumer renders on demand (a frontend page load, an SSG build step, a reader RSS client)
- Stale-by-a-few-minutes is fine
- You don't want to maintain a list of subscribers on the server
- You want HTTP caching (CDN, browser, Redis) to do most of the work

**`POST /api/feed/webhook` — push model.** The origin decides when to deliver. Publishing a post triggers an immediate outbound call carrying the payload, so subscribers learn about the new post the moment it exists. The cost is operational complexity — you now own a delivery pipeline with retries, failure handling, signature verification, and a list of subscribers to maintain. Push is the right shape when:

- Freshness matters more than simplicity (mirrors, social auto-post, search indexers, Slack/Discord bots)
- Polling would be wasteful (thousands of consumers checking every minute for a change that happens once a day)
- The consumer is a server rather than a browser (browsers can't host an inbound HTTP endpoint)

**How they compose.** The two models are not mutually exclusive — they cover different consumer profiles of the same post. A React frontend pulls `GET /api/feed` on page load (simple, cacheable). A Slack bot or mirror site subscribes to the webhook and reacts only when something actually changes (efficient, real-time). Both receive the **same canonical `Post` shape**, which is the whole point of aligning the wire format: one contract, two delivery strategies, zero duplication.

**Important asymmetry.** `GET /api/feed` gives you a window of the 9 most recent posts so a fresh consumer can backfill its view with one call. `POST /api/feed/webhook` delivers exactly **one** post — the one that just got published. Consumers that miss webhook deliveries (network errors, downtime) should fall back to `GET /api/feed` to reconcile, which is why both endpoints return the same shape and expose published posts in the same order.

### Feed endpoints

Two dedicated endpoints expose this canonical shape to external frontends:

| Method | Path | Model | Purpose |
|--------|------|-------|---------|
| `GET` | `/api/feed?page=N` | Pull | Consumer-initiated. Paginated read of the last 9 published posts, 3 per page (`page` is 1, 2, or 3). Safe, cacheable, idempotent. |
| `POST` | `/api/feed/webhook` | Push | Origin-initiated. Fired immediately on publish; carries the just-published post in the canonical shape as its payload. Body is optional — see below. |

#### `GET /api/feed`

Returns the `FeedPage` shape above. Intended to be polled or hydrated on page load by subscriber frontends that don't want to consume the full `/api/posts` listing.

```bash
curl -s http://localhost:8001/api/feed?page=1 | jq
```

```json
{
  "items": [ /* 3 Post objects */ ],
  "page": 1,
  "pageSize": 3,
  "totalPages": 3,
  "totalPosts": 9,
  "hasNext": true,
  "hasPrev": false
}
```

Constraints:

- `page` is clamped to `1 ≤ page ≤ 3` (422 if out of range).
- Always serves up to the 9 most recent **published** posts (drafts are never exposed here).
- Response is cached in Redis; cache is invalidated automatically on publish via the webhook below.

#### `POST /api/feed/webhook`

The publish webhook. This is the push-shaped endpoint — fire it as part of the publish flow and the response body **is the payload** subscribers receive.

**Request body** (optional):

```json
{ "slug": "async-fastapi-with-sqlalchemy-2" }
```

- If `slug` is provided, returns that specific post (regardless of `draft` status, since this endpoint represents "the post was just published").
- If the body is omitted or empty, returns the most recently published post.

**Response**: 200 with a single `Post` object (the canonical shape above).

```bash
# Fire on publish, targeting a specific slug
curl -s -X POST http://localhost:8001/api/feed/webhook \
  -H "Content-Type: application/json" \
  -d '{"slug": "async-fastapi-with-sqlalchemy-2"}' | jq

# Or with no body — returns the latest published post
curl -s -X POST http://localhost:8001/api/feed/webhook | jq
```

**Errors**:

| Status | When |
|--------|------|
| `404` | `slug` given but no such post exists, or no body and no published posts exist at all |

The webhook invalidates the feed cache (`feed:*`) and the post-list cache (`posts:list:*`) so the next `GET /api/feed` call reflects the new post.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/posts` | List posts. Params: `page`, `pageSize`, `tag`, `category`, `includeDrafts` |
| `POST` | `/api/posts` | Create a post |
| `GET` | `/api/posts/{slug}` | Get a single post |
| `PUT` | `/api/posts/{slug}` | Update a post |
| `DELETE` | `/api/posts/{slug}` | Delete a post |
| `GET` | `/api/feed` | Paginated canonical feed — last 9 posts, 3 per page (see [Post wire format](#post-wire-format)) |
| `POST` | `/api/feed/webhook` | Publish webhook — returns the just-published post in canonical format |
| `GET` | `/api/categories` | List all categories with post counts |
| `GET` | `/api/categories/{slug}` | Get a single category |
| `GET` | `/api/tags` | List tags sorted by usage |
| `GET` | `/api/search?q=...` | Full-text search (PostgreSQL tsvector) |
| `GET` | `/health` | DB + Redis health check |
| `GET` | `/feed.xml` | Atom/RSS feed |
| `GET` | `/sitemap.xml` | XML sitemap |
| `GET` | `/docs` | Interactive API docs (Swagger UI) |
| `GET` | `/redoc` | ReDoc API docs |

Interactive docs are available at `http://localhost:8001/docs` when the backend is running.

---

## Security

| Area | Implementation |
|------|---------------|
| **CORS** | Configured via `ALLOWED_ORIGINS` env var. Only listed origins may call the API. |
| **Secret key** | `SECRET_KEY` env var. Must be a strong random value in production. |
| **Docker** | Backend runs as a non-root user inside the container. `.dockerignore` excludes `.env*` files. |
| **DB port** | PostgreSQL bound to `localhost` only — not exposed to the Docker host network. |
| **No secrets in image** | `.env*` excluded from all Docker images via `.dockerignore`. |
| **Input validation** | Pydantic v2 validates all request bodies at the framework boundary. |
| **SQL injection** | All queries use SQLAlchemy ORM or parameterised statements — no raw string interpolation. |

### Future Security Improvements

| Priority | Improvement | Why |
|----------|------------|-----|
| **High** | Rate limiting on search + list endpoints | Prevents abuse of the full-text search |
| **Medium** | HTTPS in production | TLS termination at reverse proxy or cloud provider |
| **Medium** | Content-Security-Policy header | Supplementary XSS protection |
| **Low** | Referrer-Policy header | Prevents referrer leakage to external links |
| **Low** | Request ID tracking | Log correlation across frontend and backend |

---

## CI/CD

No CI/CD pipeline exists yet. Planned:

| Workflow | Trigger | Jobs |
|----------|---------|------|
| **CI** | Push to `main`, PRs | Ruff lint, mypy type check, pytest (if tests are added) |
| **Dependabot** | Weekly | Grouped Python + Node dependency updates |
| **Deploy** | Push to `main` | Build Docker images, push to registry, deploy to server |

The project currently follows a simple single-branch workflow on `main`. When CI is set up:

- `main` will be protected — no direct pushes
- A `development` branch will be used for day-to-day work
- A PR to `main` will be required to merge, with CI passing

---

## Deploying to Koyeb

This project deploys as two Koyeb Services (backend + frontend) with a serverless Postgres database and Upstash as the Redis cache. All providers have a free tier that covers a personal blog indefinitely.

### Choosing a Postgres provider

Two serverless Postgres providers fit this stack well. Pick one before starting.

| | **Neon** | **Supabase** |
|---|---|---|
| Free storage | 0.5 GB | 500 MB |
| Idle behaviour | Compute suspends after **5 min** idle; wakes automatically on first query | Entire project pauses after **1 week** of inactivity; requires manual reactivation |
| asyncpg compatibility | Native — no gotchas | Must use the **direct connection** URL, not the pooler (see step 2) |
| Extra services | None | Auth, Storage, Realtime, REST API |
| Best fit | This project ✓ | Projects already using the Supabase ecosystem |

Neon is the better default here: its autosuspend is transparent to the app (the SQLAlchemy engine reconnects silently), whereas Supabase's project pause blocks all traffic until you click **Restore** in the dashboard.

---

### Free tier at a glance

| Provider | What you get for free | Relevant limit |
|----------|----------------------|----------------|
| **Koyeb** | 1 web service · 512 MB RAM · 0.1 vCPU | Free tier covers **one** service — see note below |
| **Neon** | 1 project · 0.5 GB storage · 191 compute-hours/month | Suspends after 5 min idle, wakes on first query |
| **Supabase** | 1 project · 500 MB storage · 2 projects total | Pauses after 1 week inactive, manual reactivation |
| **Upstash** | 1 Redis database · 10 000 commands/day · 256 MB | Enough for a personal blog with caching |

> **Two services, one free slot.** Koyeb's free tier covers a single web service. For a backend + frontend setup, the second service needs a paid instance. The cheapest option is the **Eco** instance (~$0.003/hr, billed per second) — running a lightweight Nginx container costs under a dollar a month. Alternatively, host the frontend for free on Cloudflare Pages or Netlify (it is a static build) and reserve the Koyeb free slot for the backend.

> **Uploads volume.** Koyeb persistent volumes are not available on free or Eco instances — they require a **Standard** instance type and are only available in the `fra` (Frankfurt) and `was` (Washington D.C.) regions. On the free tier, cover images must be referenced as external URLs (e.g. Cloudinary, Imgur). To use the built-in upload endpoint, upgrade the backend to a Standard instance and attach a volume as described in step 7.

---

### Architecture

```
Browser
  └─► blog-frontend.koyeb.app      (Nginx · static React build)
        └─► blog-backend.koyeb.app      (FastAPI · Uvicorn)
              ├─► Neon or Supabase       (serverless PostgreSQL)
              └─► Upstash Redis          (serverless Redis)
```

Koyeb deploys directly from GitHub — it clones the repo, builds the Dockerfile in the configured work directory, and runs the container. There are no platform config files to commit; everything is configured via the dashboard or CLI.

---

### Prerequisites

- A **Koyeb** account — [app.koyeb.com](https://app.koyeb.com)
- A **Neon** account — [neon.tech](https://neon.tech) **or** a **Supabase** account — [supabase.com](https://supabase.com) (both free, no card required)
- An **Upstash** account — [upstash.com](https://upstash.com) (free, no card required)
- Your repo pushed to GitHub
- Koyeb CLI:
  ```bash
  # macOS / Linux (Homebrew)
  brew install koyeb/tap/koyeb

  # Any platform
  curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
  export PATH=$HOME/.koyeb/bin:$PATH
  ```
- `koyeb login`
- `openssl` for generating `SECRET_KEY`

---

### Step 1 — Create the database

#### Neon

1. Log in to [console.neon.tech](https://console.neon.tech) and click **New Project**.
2. Name the project (e.g. `personal-blog`) and pick the region closest to your Koyeb region:

   | Koyeb region | Nearest Neon region |
   |---|---|
   | `fra` | `eu-central-1` (Frankfurt) |
   | `was` | `us-east-2` (Ohio) |
   | `sin` | `ap-southeast-1` (Singapore) |
   | `par` | `eu-west-3` (Paris) |

3. Neon creates a default database (`neondb`) and role. Open **Connection Details** and copy the connection string:
   ```
   postgresql://neondb_owner:PASSWORD@ep-XXXXX.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

#### Supabase

1. Log in to [supabase.com](https://supabase.com) and click **New project**.
2. Set a project name, a strong database password, and pick the region closest to your Koyeb region:

   | Koyeb region | Nearest Supabase region |
   |---|---|
   | `fra` | `eu-central-1` (Frankfurt) |
   | `was` | `us-east-1` (N. Virginia) |
   | `sin` | `ap-southeast-1` (Singapore) |
   | `par` | `eu-west-2` (London) |

3. Once the project is ready, go to **Project Settings → Database** and scroll to **Connection string**. Select the **Direct connection** tab — not the pooler. It looks like:
   ```
   postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
   ```

   > **Why direct connection?** Supabase's default connection string routes through Supavisor (their connection pooler) in transaction mode. asyncpg uses PostgreSQL prepared statements, which are not supported in transaction mode pooling and cause errors at runtime. The direct connection bypasses the pooler entirely.

---

### Step 2 — Adapt the database URL for asyncpg

This step is the same for both providers: the URL scheme must be changed and SSL must be present. The details differ slightly.

#### Neon

**Change the scheme:** SQLAlchemy's engine (see [database.py:6](backend/python/app/database.py#L6)) selects the driver from the URL prefix. Neon gives `postgresql://`; asyncpg requires `postgresql+asyncpg://`:

```
# From Neon:
postgresql://neondb_owner:PASSWORD@ep-XXXXX.eu-central-1.aws.neon.tech/neondb?sslmode=require

# DATABASE_URL to set:
postgresql+asyncpg://neondb_owner:PASSWORD@ep-XXXXX.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Change only the leading scheme — keep `?sslmode=require` exactly as Neon gave it. Neon enforces TLS and will reject connections without it.

**Autosuspend handling:** Neon suspends compute after 5 minutes of idle. The engine's `pool_pre_ping=True` sends a lightweight `SELECT 1` before reusing any pooled connection. If the connection is dead (Neon suspended), SQLAlchemy silently drops it and opens a fresh one. The request that wakes Neon adds roughly one second of latency; all subsequent requests are normal.

#### Supabase

**Change the scheme and add SSL:** Supabase's direct connection URL uses `postgresql://` and does not include `?sslmode=require` — you must add it:

```
# From Supabase (direct connection tab):
postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres

# DATABASE_URL to set:
postgresql+asyncpg://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres?sslmode=require
```

Two changes: scheme prefix (`postgresql+asyncpg://`) and the appended `?sslmode=require`. Supabase enforces TLS on all connections.

**Project pause handling:** Supabase pauses the entire project after one week of inactivity. Unlike Neon's compute-level suspend, a paused Supabase project cannot accept connections at all until manually restored via the dashboard (**Project Settings → General → Restore project**). `pool_pre_ping=True` will detect the dead connection and retry, but the retry will also fail until the project is restored. For a blog that may go quiet for weeks, Neon's automatic wake-up is more reliable.

---

### Step 3 — Set up Redis (Upstash)

1. Create a free account at [upstash.com](https://upstash.com).
2. Create a new **Redis** database. Choose the region closest to your Koyeb services (`eu-central-1` ≈ `fra`, `us-east-1` ≈ `was`).
3. On the database detail page, open the **Details** tab and copy the **Redis URL**:
   ```
   redis://default:PASSWORD@xxx-xxx.upstash.io:PORT
   ```
   This is your `REDIS_URL`. Use `rediss://` instead of `redis://` if you want TLS.

---

### Step 4 — Choose a Koyeb region

| Code | Location | Volumes |
|------|----------|---------|
| `fra` | Frankfurt, Germany | yes |
| `was` | Washington D.C., USA | yes |
| `sin` | Singapore | no |
| `tyo` | Tokyo, Japan | no |
| `par` | Paris, France | no |

If you need the uploads volume, use `fra` or `was`. Co-locate the frontend in the same region to avoid inter-region latency.

All commands below use `<region>` — substitute your chosen code throughout.

---

### Step 5 — Create Koyeb Secrets

Koyeb Secrets are encrypted at rest, scoped to your organisation, and injected as environment variables at runtime. The `blog-database-url` value differs by provider — use whichever URL you built in step 2.

```bash
# Neon:
koyeb secrets create blog-database-url \
  --value "postgresql+asyncpg://neondb_owner:PASSWORD@ep-XXXXX.<neon-region>.aws.neon.tech/neondb?sslmode=require"

# Supabase (direct connection):
koyeb secrets create blog-database-url \
  --value "postgresql+asyncpg://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres?sslmode=require"

koyeb secrets create blog-redis-url \
  --value "redis://default:PASSWORD@xxx-xxx.upstash.io:PORT"

koyeb secrets create blog-secret-key \
  --value "$(openssl rand -hex 32)"

koyeb secrets create blog-login-username \
  --value "your_admin_username"

koyeb secrets create blog-login-password \
  --value "a_strong_random_password"

koyeb secrets create blog-secure-path \
  --value "your-secret-admin-path"

# Admin path args — baked into the JS bundle at build time
koyeb secrets create blog-vite-path-login    --value "your-login-path"
koyeb secrets create blog-vite-path-new      --value "your-new-post-path"
koyeb secrets create blog-vite-path-update   --value "your-update-path"
koyeb secrets create blog-vite-path-dreams   --value "your-dreams-path"
koyeb secrets create blog-vite-path-info     --value "your-info-path"
```

Verify: `koyeb secrets list`

---

### Step 6 — Deploy the backend service

Koyeb clones the repo, enters `backend/python/`, and builds the `Dockerfile` there.

**Via dashboard** (recommended for first deploy):

1. **Create Service → GitHub** — select your repo and `main` branch
2. **Builder**: Dockerfile · **Work directory**: `backend/python`
3. **Port**: `8000`
4. **Health check**: HTTP · path `/health` · initial delay `30s`
5. **Instance type**: `Free` (no volume) or `Standard Nano` (volume support — `fra`/`was` only)
6. **Region**: `<region>`
7. **Environment variables**:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `{{secret.blog-database-url}}` |
| `REDIS_URL` | `{{secret.blog-redis-url}}` |
| `SECRET_KEY` | `{{secret.blog-secret-key}}` |
| `LOGIN_USERNAME` | `{{secret.blog-login-username}}` |
| `LOGIN_PASSWORD` | `{{secret.blog-login-password}}` |
| `SECURE_PATH` | `{{secret.blog-secure-path}}` |
| `ALLOWED_ORIGINS` | `https://your-blog-frontend.koyeb.app` |
| `SITE_URL` | `https://your-blog-frontend.koyeb.app` |
| `SITE_NAME` | `Your Name · Blog` |
| `LOVED_ONE_EMAIL` | `someone@example.com` |
| `SMTP_HOST` | *(empty to disable)* |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | *(empty)* |
| `SMTP_PASSWORD` | *(empty)* |
| `SMTP_FROM` | *(empty)* |

**Via CLI** (equivalent):

```bash
koyeb services create blog-backend \
  --git github.com/YOUR_USER/personal-blog \
  --git-branch main \
  --git-workdir backend/python \
  --dockerfile Dockerfile \
  --port 8000:http \
  --region <region> \
  --instance-type free \
  --health-check-http-path /health \
  --env DATABASE_URL={{secret.blog-database-url}} \
  --env REDIS_URL={{secret.blog-redis-url}} \
  --env SECRET_KEY={{secret.blog-secret-key}} \
  --env LOGIN_USERNAME={{secret.blog-login-username}} \
  --env LOGIN_PASSWORD={{secret.blog-login-password}} \
  --env SECURE_PATH={{secret.blog-secure-path}} \
  --env ALLOWED_ORIGINS="https://your-blog-frontend.koyeb.app" \
  --env SITE_URL="https://your-blog-frontend.koyeb.app" \
  --env SITE_NAME="Your Name · Blog" \
  --env LOVED_ONE_EMAIL="someone@example.com" \
  --env SMTP_HOST="" \
  --env SMTP_PORT="587" \
  --env SMTP_USERNAME="" \
  --env SMTP_PASSWORD="" \
  --env SMTP_FROM="" \
  --scale 1
```

On first boot `create_tables()` runs (SQLAlchemy creates the schema against the database), then the entrypoint runs the test suite before the container accepts traffic. Watch it:

```bash
koyeb services logs blog-backend
```

Once green, confirm the database and Redis connections are alive:

```bash
curl https://your-blog-backend.koyeb.app/health
# → {"status":"ok","db":"ok","redis":"ok"}
```

---

### Step 7 — Attach the uploads volume (paid instances only)

Skip this step if you are on the free instance type and storing cover images as external URLs.

The volume must be created in the same region as the service.

**Via dashboard**: **Volumes → Create Volume** → name `blog-uploads`, region `<region>`, size `5 GB` → open the backend service → **Storage** tab → **Attach volume** → mount path `/app/uploads`.

**Via CLI**:

```bash
koyeb volumes create blog-uploads --region <region> --size 5

koyeb services update blog-backend \
  --instance-type standard-nano \
  --volume blog-uploads:/app/uploads
```

> Volumes support one Service at a time at scale 1. To scale horizontally later, migrate uploads to object storage (e.g. Cloudflare R2 or AWS S3).

---

### Step 8 — Deploy the frontend service

Koyeb forwards every environment variable on a service to the Docker build as `--build-arg` values. The `ARG` declarations already present in `frontend/Dockerfile` pick them up, so Vite bakes `VITE_*` values into the JS bundle at compile time — no special handling needed.

**Via dashboard**:

1. **Create Service → GitHub** — same repo, `main` branch
2. **Builder**: Dockerfile · **Work directory**: `frontend`
3. **Port**: `80`
4. **Instance type**: `Free` (or `Eco` if the free slot is taken by the backend)
5. **Region**: `<region>`
6. **Environment variables**:

| Name | Value |
|------|-------|
| `VITE_API_BASE` | `https://your-blog-backend.koyeb.app` |
| `VITE_SECURE_PATH` | `{{secret.blog-secure-path}}` |
| `VITE_PATH_LOGIN` | `{{secret.blog-vite-path-login}}` |
| `VITE_PATH_ADMIN_NEW` | `{{secret.blog-vite-path-new}}` |
| `VITE_PATH_ADMIN_UPDATE` | `{{secret.blog-vite-path-update}}` |
| `VITE_PATH_ADMIN_DREAMS` | `{{secret.blog-vite-path-dreams}}` |
| `VITE_PATH_ADMIN_INFO` | `{{secret.blog-vite-path-info}}` |

**Via CLI**:

```bash
koyeb services create blog-frontend \
  --git github.com/YOUR_USER/personal-blog \
  --git-branch main \
  --git-workdir frontend \
  --dockerfile Dockerfile \
  --port 80:http \
  --region <region> \
  --instance-type free \
  --env VITE_API_BASE="https://your-blog-backend.koyeb.app" \
  --env VITE_SECURE_PATH={{secret.blog-secure-path}} \
  --env VITE_PATH_LOGIN={{secret.blog-vite-path-login}} \
  --env VITE_PATH_ADMIN_NEW={{secret.blog-vite-path-new}} \
  --env VITE_PATH_ADMIN_UPDATE={{secret.blog-vite-path-update}} \
  --env VITE_PATH_ADMIN_DREAMS={{secret.blog-vite-path-dreams}} \
  --env VITE_PATH_ADMIN_INFO={{secret.blog-vite-path-info}} \
  --scale 1
```

---

### Step 9 — Verify the full stack

```bash
# Blog
open https://your-blog-frontend.koyeb.app

# API explorer
open https://your-blog-backend.koyeb.app/docs

# Health (confirms Postgres + Upstash are reachable)
curl https://your-blog-backend.koyeb.app/health

# RSS feed
curl https://your-blog-backend.koyeb.app/feed.xml
```

---

### (Optional) Step 10 — Custom domain

In the Koyeb dashboard go to **Domains → Add Domain**, enter your domain, and select the target service. Koyeb shows the CNAME record to create at your DNS provider; TLS is provisioned automatically.

| Domain | Service |
|--------|---------|
| `www.yourdomain.com` | `blog-frontend` |
| `api.yourdomain.com` | `blog-backend` |

> Koyeb does not support bare apex domains. Use `www.` and redirect the apex at your DNS provider, or use Cloudflare/Route 53 which support CNAME flattening at the zone apex.

After DNS propagates, update the backend URLs and trigger a frontend rebuild:

```bash
koyeb services update blog-backend \
  --env ALLOWED_ORIGINS="https://www.yourdomain.com" \
  --env SITE_URL="https://www.yourdomain.com"

koyeb services update blog-frontend \
  --env VITE_API_BASE="https://api.yourdomain.com"
```

---

### Day-2 operations

**Auto-redeploy on push**

Koyeb watches the configured branch and redeploys on every push automatically. To trigger a manual redeploy:

```bash
koyeb services redeploy blog-backend
koyeb services redeploy blog-frontend
```

**Scaling up**

```bash
# Upgrade to a larger instance (e.g. when the 512 MB free instance shows memory pressure)
koyeb services update blog-backend --instance-type standard-nano

# Keep scale=1 while a volume is attached.
# To scale horizontally, migrate uploads to object storage first.
```

**Rotating the secret key**

```bash
koyeb secrets update blog-secret-key --value "$(openssl rand -hex 32)"
# The service restarts automatically; existing sessions are invalidated.
```

**Database backups**

*Neon* — retains 7 days of point-in-time history on the free tier. To restore: Neon console → **Branches → Restore to point in time**, pick a timestamp, and Neon creates a new branch from that snapshot. To export a plain SQL dump:

```bash
pg_dump "postgresql://neondb_owner:PASSWORD@ep-XXXXX.<neon-region>.aws.neon.tech/neondb?sslmode=require" \
  > backup.sql
```

*Supabase* — automated daily backups on paid plans; free tier has no automated backups. To export manually:

```bash
pg_dump "postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres?sslmode=require" \
  > backup.sql
```

**Viewing logs**

```bash
koyeb services logs blog-backend
koyeb services logs blog-frontend
```

**Shell access**

```bash
koyeb services exec blog-backend /bin/sh
# Useful for inspecting /app/uploads, running one-off scripts, or checking env vars
```

---

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).
