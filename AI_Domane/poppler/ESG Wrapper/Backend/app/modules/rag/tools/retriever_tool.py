"""
Retriever Tool — callable by the agentic layer.

Performs similarity search against the user's ChromaDB collection
and returns the top-k document chunks as formatted context.
"""

from app.modules.rag.repositories.vector_repository import VectorRepository
from app.utils.logger import logger


class RetrieverTool:
    """Tool: search the user's knowledge base for relevant context."""

    name = "knowledge_base_search"
    description = (
        "Search the user's uploaded documents for information relevant to the query. "
        "Returns the top matching text chunks."
    )

    def __init__(self, vector_repo: VectorRepository) -> None:
        self._vector_repo = vector_repo

    def run(self, query: str, user_id: str) -> str:
        """Execute similarity search and return formatted context."""
        logger.info(f"RetrieverTool.run() — user={user_id}, query={query[:80]}")

        try:
            docs = self._vector_repo.similarity_search(user_id, query)

            if not docs:
                logger.info("RetrieverTool: no documents found")
                return "No relevant documents found in the knowledge base."

            # Format chunks with source metadata
            chunks = []
            for i, doc in enumerate(docs, 1):
                source = doc.metadata.get("source", "unknown")
                chunks.append(
                    f"[Source {i}: {source}]\n{doc.page_content}"
                )

            context = "\n\n---\n\n".join(chunks)
            logger.info(f"RetrieverTool: returned {len(docs)} chunks")
            return context

        except Exception as e:
            logger.error(f"RetrieverTool error: {e}")
            return f"Error searching knowledge base: {str(e)}"
