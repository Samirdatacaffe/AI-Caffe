"""
Application configuration — single source of truth for every tunable setting.

LLM:        kimi-k2.5 via Ollama Cloud (OpenAI-compatible /v1)
Embeddings: nomic-embed-text via HuggingFace (runs locally, same model)
"""

from pathlib import Path
from pydantic_settings import BaseSettings

_PROJECT_ROOT = Path(__file__).resolve().parents[2]   # Backend/


class Settings(BaseSettings):
    """Validated, immutable settings."""

    # ── Ollama Cloud (LLM only) ─────────────────────────
    OLLAMA_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "https://ollama.com/v1"
    OLLAMA_LLM_MODEL: str = "kimi-k2.5"
    LLM_TEMPERATURE: float = 0.2

    # ── OpenAI (optional — GPT uses Ollama Cloud if not set)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # ── Anthropic (optional — Sonnet 4.6 uses Ollama Cloud if not set)
    ANTHROPIC_API_KEY: str = ""

    # ── Embeddings (local nomic-embed-text) ─────────────
    EMBED_MODEL: str = "nomic-ai/nomic-embed-text-v1.5"

    # ── ChromaDB ────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = str(_PROJECT_ROOT / "app" / "db" / "chroma")

    # ── Redis ───────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── RAG tuning (optimised for nomic-embed-text) ─────
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150
    RETRIEVER_K: int = 5

    # ── Memory ──────────────────────────────────────────
    MEMORY_MAX_MESSAGES: int = 10

    # ── Data directory ──────────────────────────────────
    DATA_DIR: str = str(_PROJECT_ROOT / "Data")

    # ── Upload directory ────────────────────────────────
    UPLOAD_DIR: str = str(_PROJECT_ROOT / "uploads")

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
