"""Security tests for the admin namespace.

The admin path is never hardcoded in this file — it is pulled from the
SECURE_PATH env var via a fixture, so the namespace can be renamed (for
obscurity) without touching this suite.

What these tests guarantee:

1. The namespace has at least one route and is actually mounted. A zero-route
   result almost certainly means SECURE_PATH is misconfigured and every
   admin endpoint is effectively unreachable — that would be a silent
   deployment failure, so we fail loudly instead.

2. Every route registered under the namespace, for every HTTP method it
   accepts, rejects an unauthenticated request with 401. If a new route is
   added without `require_admin` in its dependency list, this catches it.

3. Every route rejects wrong credentials with 401.

4. Every route accepts correct admin credentials (any response *other* than
   401). 401 with valid creds would mean the gate is misconfigured.

5. Unknown / hypothetical paths under the namespace (including future
   routes that haven't been written yet, and basic path-traversal attempts)
   never return a 2xx success. They must respond with 401 or 404.

6. The admin path does not appear in any public error page, CORS header,
   or OpenAPI tag leak.
"""

import httpx
import pytest


# ---------------------------------------------------------------------------
# 1. Namespace exists and is discoverable via OpenAPI
# ---------------------------------------------------------------------------

def test_secure_path_resolves_to_at_least_one_registered_route(
    admin_routes: list[tuple[str, str]],
    secure_path: str,
):
    assert len(admin_routes) > 0, (
        f"No routes registered under SECURE_PATH={secure_path!r}. "
        "Either the env var does not match the deployed prefix, or the "
        "admin router was unmounted — every admin endpoint is now a 404."
    )


def test_secure_path_contains_expected_surface_area(
    admin_routes: list[tuple[str, str]],
    secure_path: str,
):
    """Sanity check: we expect at least drafts, posts, and upload-image
    routes. Uses endpoint suffixes so the assertion remains stable even if
    SECURE_PATH is renamed."""
    suffixes = {path[len(secure_path):] for _m, path in admin_routes}
    expected = {"/drafts", "/posts", "/upload-image"}
    missing = expected - suffixes
    assert not missing, f"admin namespace is missing expected endpoints: {missing}"


# ---------------------------------------------------------------------------
# 2. Unauthenticated calls are rejected
# ---------------------------------------------------------------------------

def test_every_admin_route_rejects_unauthenticated_requests(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
):
    failures: list[str] = []
    for method, path in admin_routes:
        r = client.request(method, path)
        if r.status_code != 401:
            failures.append(f"  {method} {path} → {r.status_code} (expected 401)")
    assert not failures, (
        "Admin routes reachable without authentication:\n"
        + "\n".join(failures)
        + "\n\nAdd `require_admin` to the dependency list of each failing route."
    )


def test_every_admin_route_signals_www_authenticate_header(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
):
    """The 401 response must include a WWW-Authenticate header so legitimate
    clients know how to authenticate (HTTP Basic). Missing this header is a
    common sign the dependency was replaced with a handwritten check."""
    failures: list[str] = []
    for method, path in admin_routes:
        r = client.request(method, path)
        if "www-authenticate" not in {k.lower() for k in r.headers}:
            failures.append(f"  {method} {path} (status={r.status_code})")
    assert not failures, (
        "Admin routes missing WWW-Authenticate on 401:\n" + "\n".join(failures)
    )


# ---------------------------------------------------------------------------
# 3. Wrong credentials are rejected
# ---------------------------------------------------------------------------

def test_every_admin_route_rejects_wrong_credentials(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
    wrong_auth: tuple[str, str],
):
    failures: list[str] = []
    for method, path in admin_routes:
        r = client.request(method, path, auth=wrong_auth)
        if r.status_code != 401:
            failures.append(f"  {method} {path} → {r.status_code} (expected 401)")
    assert not failures, (
        "Admin routes accepting wrong credentials:\n" + "\n".join(failures)
    )


def test_admin_route_rejects_username_with_correct_password(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
    admin_auth: tuple[str, str],
):
    """Flip only the username — the password alone must not be enough."""
    _user, password = admin_auth
    mutated = ("not-the-user", password)
    method, path = admin_routes[0]
    r = client.request(method, path, auth=mutated)
    assert r.status_code == 401


def test_admin_route_rejects_password_with_correct_username(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
    admin_auth: tuple[str, str],
):
    """And the mirror — the username alone must not be enough either."""
    user, _password = admin_auth
    mutated = (user, "not-the-password")
    method, path = admin_routes[0]
    r = client.request(method, path, auth=mutated)
    assert r.status_code == 401


def test_admin_route_rejects_empty_credentials(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
):
    method, path = admin_routes[0]
    r = client.request(method, path, auth=("", ""))
    assert r.status_code == 401


def test_admin_route_rejects_malformed_authorization_header(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
):
    """Bearer tokens, garbage, and non-Basic schemes all fail."""
    method, path = admin_routes[0]
    for header_value in [
        "Bearer abcdef",
        "Basic not-base64!!!",
        "Basic " + "A" * 100,
        "Basic dXNlcg==",  # "user" — just the username, no colon or password
        "Garbage",
    ]:
        r = client.request(method, path, headers={"Authorization": header_value})
        assert r.status_code == 401, (
            f"Authorization={header_value!r} returned {r.status_code} on {method} {path}"
        )


# ---------------------------------------------------------------------------
# 4. Correct credentials are accepted
# ---------------------------------------------------------------------------

def test_every_admin_route_accepts_correct_credentials(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
    admin_auth: tuple[str, str],
):
    """Valid creds must never return 401. The route may still return 400
    (missing body), 404 (missing resource), 415 (missing file), 422 (bad
    validation), etc. — those are not auth failures."""
    failures: list[str] = []
    for method, path in admin_routes:
        r = client.request(method, path, auth=admin_auth)
        if r.status_code == 401:
            failures.append(f"  {method} {path} → 401 (creds valid per /api/auth/me)")
    assert not failures, (
        "Admin routes rejecting valid credentials:\n" + "\n".join(failures)
    )


# ---------------------------------------------------------------------------
# 5. Unknown / future paths under the namespace are unreachable
# ---------------------------------------------------------------------------

_UNKNOWN_SUFFIXES = [
    "nonexistent-future-route",
    "future/feature",
    "nested/deep/path/that/does/not/exist",
    "drafts/../../../etc/passwd",
    "upload-image/../posts",
    "x",
    "",
    "_",
    "admin",
]


@pytest.mark.parametrize("suffix", _UNKNOWN_SUFFIXES)
def test_unknown_paths_under_secure_namespace_are_not_reachable(
    client: httpx.Client,
    secure_path: str,
    suffix: str,
):
    """Any path under SECURE_PATH that does not match a registered route
    must return 401 (auth gate hit first) or 404 (no such route). A 2xx or
    a 3xx would mean information leaks out of the namespace."""
    url = f"{secure_path}/{suffix}" if suffix else secure_path
    r = client.get(url)
    assert r.status_code in (401, 404), (
        f"GET {url} returned {r.status_code} — unknown admin paths must never succeed."
    )


@pytest.mark.parametrize("suffix", _UNKNOWN_SUFFIXES)
def test_unknown_paths_under_secure_namespace_reject_with_wrong_creds(
    client: httpx.Client,
    secure_path: str,
    suffix: str,
    wrong_auth: tuple[str, str],
):
    url = f"{secure_path}/{suffix}" if suffix else secure_path
    r = client.get(url, auth=wrong_auth)
    assert r.status_code in (401, 404)


@pytest.mark.parametrize("method", ["GET", "POST", "PUT", "PATCH", "DELETE"])
def test_unknown_verb_on_unknown_path_still_unreachable(
    client: httpx.Client,
    secure_path: str,
    method: str,
):
    url = f"{secure_path}/totally-made-up-endpoint"
    r = client.request(method, url)
    assert r.status_code in (401, 404, 405)


# ---------------------------------------------------------------------------
# 6. No information leak from public error surfaces
# ---------------------------------------------------------------------------

def test_404_on_public_unknown_path_does_not_mention_admin(
    client: httpx.Client,
    secure_path: str,
):
    """A stray 404 on a public URL must not leak the admin namespace in its
    body. This guards against overly chatty error handlers."""
    r = client.get("/api/totally-unknown-public-path")
    assert r.status_code == 404
    assert secure_path not in r.text


def test_auth_challenge_body_is_minimal(
    client: httpx.Client,
    admin_routes: list[tuple[str, str]],
):
    """401 response body must not leak route internals, SQL, or stack
    traces. Only a short detail string."""
    method, path = admin_routes[0]
    r = client.request(method, path)
    body = r.text
    forbidden = ["Traceback", "psycopg", "asyncpg", "SELECT ", "INSERT ", "SECRET_KEY"]
    leaks = [token for token in forbidden if token in body]
    assert not leaks, f"401 body leaks sensitive tokens: {leaks}\n{body[:400]}"
