"""Basic smoke tests for the public API surface.

Covers only read-only endpoints so the tests never mutate production state.
Each test is a single HTTP call with a straightforward assertion.
"""

import httpx


def test_health_endpoint_responds(client: httpx.Client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, dict)


def test_openapi_schema_is_served(client: httpx.Client):
    r = client.get("/openapi.json")
    assert r.status_code == 200
    schema = r.json()
    assert schema.get("openapi")
    assert "paths" in schema and isinstance(schema["paths"], dict)


def test_public_posts_list_returns_envelope(client: httpx.Client):
    r = client.get("/api/posts")
    assert r.status_code == 200
    body = r.json()
    assert "items" in body and isinstance(body["items"], list)
    assert "total" in body
    assert "page" in body
    assert "pageSize" in body


def test_public_posts_list_excludes_drafts_by_default(client: httpx.Client):
    r = client.get("/api/posts")
    assert r.status_code == 200
    for post in r.json()["items"]:
        assert post["draft"] is False, "public list must never expose drafts"


def test_unknown_slug_returns_404(client: httpx.Client):
    r = client.get("/api/posts/this-slug-does-not-exist-zzz999")
    assert r.status_code == 404


def test_feed_page_1_returns_canonical_shape(client: httpx.Client):
    r = client.get("/api/feed", params={"page": 1})
    assert r.status_code == 200
    body = r.json()
    assert body["page"] == 1
    assert body["pageSize"] == 3
    assert "items" in body
    assert "totalPages" in body
    assert "totalPosts" in body
    assert "hasNext" in body
    assert "hasPrev" in body
    assert body["hasPrev"] is False
    assert len(body["items"]) <= 3


def test_feed_rejects_page_out_of_range(client: httpx.Client):
    r = client.get("/api/feed", params={"page": 99})
    assert r.status_code == 422


def test_feed_rejects_page_zero(client: httpx.Client):
    r = client.get("/api/feed", params={"page": 0})
    assert r.status_code == 422


def test_tags_listing_public(client: httpx.Client):
    r = client.get("/api/tags")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_categories_listing_public(client: httpx.Client):
    r = client.get("/api/categories")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_post_create_rejects_unauthenticated(client: httpx.Client):
    r = client.post("/api/posts", json={"title": "nope", "body": "nope"})
    assert r.status_code == 401


def test_feed_webhook_rejects_unauthenticated(client: httpx.Client):
    r = client.post("/api/feed/webhook")
    assert r.status_code == 401
