"""Note2Visual Backend Configuration."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./note2visual.db"

    # AI Provider
    ai_provider: str = "demo"  # openai, anthropic, google, demo
    ai_api_key: Optional[str] = None
    ai_model: Optional[str] = None

    # Provider-specific keys
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o"
    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-sonnet-4-20250514"
    google_api_key: Optional[str] = None
    google_model: str = "gemini-2.0-flash"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, v):
        if isinstance(v, str):
            if v.lower() in ("true", "1", "yes", "on", "t", "debug", "development", "dev"):
                return True
            if v.lower() in ("false", "0", "no", "off", "f", "release", "prod", "production"):
                return False
        return bool(v)

    # File upload
    max_upload_size_mb: int = 50
    upload_dir: str = "./uploads"
    export_dir: str = "./exports"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Security
    secret_key: str = "change-this-to-a-random-secret-key"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        path = Path(self.upload_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def export_path(self) -> Path:
        path = Path(self.export_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    def get_ai_api_key(self) -> Optional[str]:
        if self.ai_api_key:
            return self.ai_api_key
        provider_map = {
            "openai": self.openai_api_key,
            "anthropic": self.anthropic_api_key,
            "google": self.google_api_key,
        }
        return provider_map.get(self.ai_provider)

    def get_ai_model(self) -> str:
        if self.ai_model:
            return self.ai_model
        model_map = {
            "openai": self.openai_model,
            "anthropic": self.anthropic_model,
            "google": self.google_model,
        }
        return model_map.get(self.ai_provider, "demo")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
