from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://blog_user:blog_password@localhost:5432/blog"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-me-in-production"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    site_name: str = "Joaquín · Blog"
    site_url: str = "http://localhost:3000"
    cache_ttl: int = 300  # seconds
    posts_per_page: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
