from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve the project root relative to this file. In local dev (running
# `uvicorn` from backend/python/) this points at the repo root, where the
# single .env lives. In Docker the file is at /app/app/config.py — there
# is no project root above /app and no .env is shipped with the image, so
# we fall back to a path that won't exist; pydantic-settings will silently
# skip it and read env vars injected by docker-compose instead.
_parents = Path(__file__).resolve().parents
ENV_FILE = _parents[3] / ".env" if len(_parents) >= 4 else Path(".env")


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://blog_user:blog_password@localhost:5432/blog"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-me-in-production"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    site_name: str = "Joaquín · Blog"
    site_url: str = "http://localhost:3000"
    cache_ttl: int = 300
    posts_per_page: int = 10
    login_username: str = "user"
    login_password: str = "Test123!"

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",  # the root .env carries POSTGRES_*, VITE_*, etc. for other consumers
    )

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
