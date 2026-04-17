"""Shared fixtures for the backend test suite.

Tests run as black-box integration tests against the live backend service
reachable at BACKEND_URL. This mirrors production behaviour — middleware,
CORS, auth dependencies, route matching all participate — without mocking
anything away.

Run `docker compose up -d` first so the backend is reachable, then:

    docker compose exec backend pytest -v tests/
"""

import os

import httpx
import pytest

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")
SECURE_PATH = os.environ["SECURE_PATH"]
ADMIN_USERNAME = os.environ["LOGIN_USERNAME"]
ADMIN_PASSWORD = os.environ["LOGIN_PASSWORD"]


@pytest.fixture(scope="session")
def backend_url() -> str:
    return BACKEND_URL


@pytest.fixture(scope="session")
def secure_path() -> str:
    """Admin namespace prefix, read from env. Never hardcoded in test bodies."""
    return SECURE_PATH


@pytest.fixture(scope="session")
def admin_auth() -> tuple[str, str]:
    """Valid HTTP Basic credentials for the admin namespace."""
    return (ADMIN_USERNAME, ADMIN_PASSWORD)


@pytest.fixture(scope="session")
def wrong_auth() -> tuple[str, str]:
    """Deliberately invalid credentials — should never be accepted."""
    return ("nobody", "not-the-password-xyz")


@pytest.fixture(scope="session")
def client(backend_url: str):
    """Long-lived httpx client pointed at the live backend."""
    with httpx.Client(base_url=backend_url, timeout=10.0) as c:
        yield c


@pytest.fixture(scope="session")
def admin_routes(client: httpx.Client, secure_path: str) -> list[tuple[str, str]]:
    """Every (METHOD, path) pair registered under the admin namespace.

    Enumerated dynamically from the live `/openapi.json` so that new routes
    added under the prefix are picked up automatically — the security test
    then asserts each one is gated.
    """
    r = client.get("/openapi.json")
    assert r.status_code == 200, "backend must be running to collect admin routes"
    paths = r.json().get("paths", {})
    collected: list[tuple[str, str]] = []
    for path, methods in paths.items():
        if path == secure_path or path.startswith(secure_path + "/"):
            for method, _spec in methods.items():
                if method.upper() in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
                    collected.append((method.upper(), path))
    return collected
