from __future__ import annotations
"""
Data-access layer for conversation memory.

Strategy:
  1. Try Redis (production)  →  RedisChatMessageHistory
  2. Fallback to in-memory   →  ChatMessageHistory

Each user_id gets its own isolated message history.
The memory window is capped at MEMORY_MAX_MESSAGES to keep
prompts within token budgets.
"""

from langchain.memory import ConversationBufferWindowMemory
from langchain_community.chat_message_histories import ChatMessageHistory

from app.core.config import settings
from app.utils.logger import logger

# ── In-memory fallback store (process-level) ────────────
_in_memory_store: dict[str, ChatMessageHistory] = {}


class MemoryRepository:
    """Conversation memory with Redis → in-memory fallback."""

    def __init__(self) -> None:
        self._redis_available = self._check_redis()

    # ── private ─────────────────────────────────────────

    @staticmethod
    def _check_redis() -> bool:
        """Test whether Redis is reachable."""
        try:
            import redis as _redis
            client = _redis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
            client.ping()
            logger.info(f"Redis connected at {settings.REDIS_URL}")
            return True
        except Exception as e:
            logger.warning(f"Redis unavailable ({e}) — falling back to in-memory")
            return False

    def _get_history(self, user_id: str):
        """Return the raw message-history backend for a user."""
        if self._redis_available:
            try:
                from langchain_community.chat_message_histories import (
                    RedisChatMessageHistory,
                )
                return RedisChatMessageHistory(
                    session_id=user_id,
                    url=settings.REDIS_URL,
                )
            except Exception as e:
                logger.warning(f"Redis error for user={user_id}: {e}, using in-memory")

        # Fallback: process-local dict
        if user_id not in _in_memory_store:
            _in_memory_store[user_id] = ChatMessageHistory()
        return _in_memory_store[user_id]

    # ── public ──────────────────────────────────────────

    def get_memory(self, user_id: str) -> ConversationBufferWindowMemory:
        """Return a windowed memory (last N messages) for the user."""
        history = self._get_history(user_id)
        return ConversationBufferWindowMemory(
            chat_memory=history,
            memory_key="chat_history",
            return_messages=True,
            output_key="answer",
            k=settings.MEMORY_MAX_MESSAGES,
        )

    def get_recent_messages(self, user_id: str, limit: int | None = None) -> list[dict]:
        """Return the last *limit* messages as plain dicts (for the prompt builder)."""
        history = self._get_history(user_id)
        messages = history.messages[-(limit or settings.MEMORY_MAX_MESSAGES):]
        return [
            {"role": m.type, "content": m.content}
            for m in messages
        ]
