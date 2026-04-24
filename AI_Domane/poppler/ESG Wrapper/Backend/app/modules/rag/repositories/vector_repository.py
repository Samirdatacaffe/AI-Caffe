from __future__ import annotations
"""
Data-access layer for ChromaDB — per-user collection isolation.

Embeddings: nomic-embed-text-v1.5 via HuggingFace sentence-transformers.
Runs locally on CPU — same model as Ollama's nomic-embed-text, no API needed.
"""

from pathlib import Path
from typing import List

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStoreRetriever

from app.core.config import settings
from app.utils.logger import logger


class VectorRepository:
    """Per-user ChromaDB operations with local nomic-embed-text embeddings."""

    def __init__(self) -> None:
        self._embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBED_MODEL,
            model_kwargs={"trust_remote_code": True},
            encode_kwargs={"normalize_embeddings": True},
        )
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=[
                "\n\n\n",      # Major section breaks in ESG.txt
                "\n\n",        # Subsection breaks
                "\n",          # Line breaks
                ". ",          # Sentence boundaries
                " ",
                "",
            ],
        )
        logger.info(
            f"VectorRepository initialised — "
            f"embed={settings.EMBED_MODEL} (local), "
            f"chunk={settings.CHUNK_SIZE}/{settings.CHUNK_OVERLAP}"
        )

    # ── helpers ─────────────────────────────────────────

    def _collection_name(self, user_id: str) -> str:
        safe = user_id.replace("-", "_").replace(" ", "_")[:50]
        return f"user_{safe}"

    def _get_vectorstore(self, user_id: str) -> Chroma:
        return Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=self._embeddings,
            collection_name=self._collection_name(user_id),
        )

    # ── read ────────────────────────────────────────────

    def get_retriever(self, user_id: str) -> VectorStoreRetriever:
        return self._get_vectorstore(user_id).as_retriever(
            search_type="similarity",
            search_kwargs={"k": settings.RETRIEVER_K},
        )

    def similarity_search(self, user_id: str, query: str, k: int | None = None) -> List[Document]:
        vs = self._get_vectorstore(user_id)
        return vs.similarity_search(query, k=k or settings.RETRIEVER_K)

    # ── write ───────────────────────────────────────────

    def ingest_file(self, file_path: str, user_id: str) -> int:
        logger.info(f"Ingesting file={file_path} for user={user_id}")

        loader = TextLoader(file_path, encoding="utf-8")
        documents = loader.load()

        for doc in documents:
            doc.metadata["user_id"] = user_id

        chunks = self._splitter.split_documents(documents)

        Chroma.from_documents(
            documents=chunks,
            embedding=self._embeddings,
            persist_directory=settings.CHROMA_PERSIST_DIR,
            collection_name=self._collection_name(user_id),
        )
        logger.info(f"Stored {len(chunks)} chunks for user={user_id}")
        return len(chunks)

    def ingest_directory(self, data_dir: str, user_id: str) -> int:
        data_path = Path(data_dir)
        txt_files = list(data_path.rglob("*.txt"))
        logger.info(f"Found {len(txt_files)} .txt file(s) in {data_path}")

        if not txt_files:
            logger.warning("No .txt files found — nothing to ingest")
            return 0

        total = 0
        for fp in txt_files:
            total += self.ingest_file(str(fp), user_id)
        return total

    def ingest_text(self, text: str, user_id: str, source: str = "upload") -> int:
        doc = Document(page_content=text, metadata={"source": source, "user_id": user_id})
        chunks = self._splitter.split_documents([doc])

        Chroma.from_documents(
            documents=chunks,
            embedding=self._embeddings,
            persist_directory=settings.CHROMA_PERSIST_DIR,
            collection_name=self._collection_name(user_id),
        )
        logger.info(f"Stored {len(chunks)} chunks from text upload for user={user_id}")
        return len(chunks)
