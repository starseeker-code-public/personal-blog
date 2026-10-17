"""Smoke tests for what crawlers get: page heads (link previews) and the sitemap.

Read-only and independent of which posts exist, like test_basics.py.
"""

import httpx


def test_home_head_is_english_with_a_spanish_alternate(client: httpx.Client):
    r = client.get("/seo/head/en")
    assert r.status_code == 200
    assert "<title>" in r.text
    assert 'property="og:title"' in r.text
    assert 'property="og:image"' in r.text
    assert 'property="og:locale" content="en_US"' in r.text
    assert 'rel="canonical"' in r.text
    assert 'hreflang="es"' in r.text
    assert 'hreflang="x-default"' in r.text


def test_spanish_about_head_is_in_spanish(client: httpx.Client):
    r = client.get("/seo/head/es/about")
    assert r.status_code == 200
    assert 'property="og:locale" content="es_ES"' in r.text
    assert 'property="og:type" content="profile"' in r.text
    assert "Sobre mí" in r.text


def test_unknown_post_head_is_not_indexed(client: httpx.Client):
    r = client.get("/seo/head/es/posts/this-slug-does-not-exist-zzz999")
    assert r.status_code == 200
    assert 'name="robots" content="noindex"' in r.text
    assert 'rel="canonical"' not in r.text


def test_head_never_echoes_the_requested_path(client: httpx.Client):
    r = client.get("/seo/head/es/tags/%3Cscript%3Ealert(1)%3C%2Fscript%3E")
    assert r.status_code == 200
    assert "<script" not in r.text
    assert "alert(1)" not in r.text


def test_sitemap_lists_home_in_both_languages(client: httpx.Client):
    r = client.get("/sitemap.xml")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("application/xml")
    assert "/en</loc>" in r.text
    assert "/es</loc>" in r.text
    assert 'hreflang="x-default"' in r.text
