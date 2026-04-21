"""
Business-logic layer for document ingestion.

Handles:
  ● File upload (UploadFile → save to disk → ingest)
  ● Directory ingestion (bulk load from a path)
  ● Text cleaning before chunking
"""

import os
import re
from pathlib import Path

from app.core.config import settings
from app.modules.rag.repositories.vector_repository import VectorRepository
from app.utils.logger import logger


class IngestService:
    """Orchestrates document ingestion into per-user ChromaDB collections."""

    def __init__(self) -> None:
        self._vector_repo = VectorRepository()

    # ── text cleaning ───────────────────────────────────

    @staticmethod
    def _clean_text(text: str) -> str:
        """Basic text cleaning before chunking."""
        # Normalise whitespace (collapse multiple blanks)
        text = re.sub(r"[ \t]+", " ", text)
        # Normalise line breaks (max 2 consecutive)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    # ── public API ──────────────────────────────────────

    async def ingest_upload(self, file_content: bytes, filename: str, user_id: str) -> int:
        """Ingest an uploaded text file for a specific user.

        1. Save file to uploads/<user_id>/
        2. Clean text
        3. Chunk + embed + store in ChromaDB
        """
        logger.info(f"IngestService.ingest_upload() — file={filename}, user={user_id}")

        # Save uploaded file
        user_upload_dir = Path(settings.UPLOAD_DIR) / user_id
        user_upload_dir.mkdir(parents=True, exist_ok=True)

        file_path = user_upload_dir / filename
        file_path.write_bytes(file_content)
        logger.info(f"Saved upload to {file_path}")

        # Read, clean, and ingest
        text = file_content.decode("utf-8", errors="ignore")
        text = self._clean_text(text)

        count = self._vector_repo.ingest_text(text, user_id, source=filename)
        logger.info(f"Ingest complete — {count} chunks for user={user_id}")
        return count

    def ingest_directory(self, data_dir: str | None, user_id: str) -> int:
        """Ingest all .txt files from a directory for a specific user."""
        directory = data_dir or settings.DATA_DIR
        logger.info(f"IngestService.ingest_directory() — dir={directory}, user={user_id}")
        return self._vector_repo.ingest_directory(directory, user_id)
