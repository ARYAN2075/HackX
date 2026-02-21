"""
=============================================================================
HACK HUNTERS - Smart Document Assistant
Application Configuration
=============================================================================
Centralizes all configuration using pydantic-settings for type safety
and automatic environment variable loading.
=============================================================================
"""

import os
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve the .env file path relative to this config file's directory
_BACKEND_DIR = Path(__file__).resolve().parent
_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- Google Gemini ---
    GEMINI_API_KEY: str

    # --- Pinecone ---
    PINECONE_API_KEY: str
    PINECONE_ENV: str
    PINECONE_INDEX_NAME: str = "hack-hunters-docs"

    # --- File Upload ---
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: str = "pdf,docx,txt"

    # --- RAG Settings ---
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K: int = 5
    EMBEDDING_MODEL: str = "models/embedding-001"
    LLM_MODEL: str = "gemini-1.5-flash"

    # --- Application ---
    LOG_LEVEL: str = "INFO"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    @property
    def allowed_extensions_list(self) -> list[str]:
        """Return allowed file extensions as a list."""
        return [ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        """Return max file size in bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings factory. Returns the same Settings instance
    across the application lifecycle.
    """
    return Settings()