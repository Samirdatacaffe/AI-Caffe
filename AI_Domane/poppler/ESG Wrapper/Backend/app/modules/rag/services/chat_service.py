from __future__ import annotations
"""
Business-logic layer for chat — delegates to the AgentService.

This service exists so the controller doesn't import the agent directly,
maintaining the controller → service → (agent → tools → repos) hierarchy.
"""

from typing import AsyncIterator

from app.modules.rag.services.agent_service import AgentService
from app.utils.logger import logger


class ChatService:
    """Thin wrapper that delegates chat to the agentic pipeline."""

    def __init__(self) -> None:
        self._agent = AgentService()

    async def stream(
        self,
        question: str,
        user_id: str,
        model: str | None = None,
        solution: str | None = None,
        messages: list[dict] | None = None,
    ) -> AsyncIterator[str]:
        """Stream the agent's response as SSE events."""
        logger.info(
            f"ChatService.stream() — user={user_id}, model={model}, solution={solution}"
        )

        try:
            async for event in self._agent.run(
                question, user_id, model, solution, messages
            ):
                yield event
        except Exception as e:
            import json
            logger.error(f"ChatService error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
