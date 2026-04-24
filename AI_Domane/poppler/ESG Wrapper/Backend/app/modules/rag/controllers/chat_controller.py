from __future__ import annotations
"""
Chat Controller — streaming endpoint.

Endpoint: POST /api/v1/chat/stream
  ● Accepts question + model + solution (+ optional messages / user_id)
  ● Returns Server-Sent Events (SSE) token-by-token

SSE event format:
  data: {"type": "status",  "content": "Routing to brew-esg-1.2 pipeline..."}
  data: {"type": "token",   "content": "ISAE"}
  data: {"type": "sources", "content": [{...}, ...]}
  data: {"type": "done"}
"""

import uuid
import traceback

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.modules.rag.services.chat_service import ChatService
from app.utils.logger import logger

router = APIRouter(prefix="/chat", tags=["Chat"])

_chat_service = ChatService()


# ── Request Schema ─────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    user_id: str | None = None
    session_id: str | None = None       # alias for user_id
    model: str | None = None            # e.g. "kimi-k2.5", "gpt", "sonnet-4.6"
    solution: str | None = None         # e.g. "brew-esg-1.2", "brew-generic-0.5"
    messages: list[dict] | None = None  # conversation history from Node.js backend


# ── Endpoints ──────────────────────────────────────────────

@router.post("/stream")
async def chat_stream(req: ChatRequest):
    """POST /api/v1/chat/stream

    Stream a LangGraph-routed, model-aware response via Server-Sent Events.
    """
    # Resolve user identity
    user_id = req.user_id or req.session_id or str(uuid.uuid4())
    logger.info(
        f"API /chat/stream — user={user_id}, model={req.model}, "
        f"solution={req.solution}, q={req.question[:80]}"
    )

    try:
        return StreamingResponse(
            _chat_service.stream(
                req.question, user_id, req.model, req.solution, req.messages
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-User-Id": user_id,
            },
        )
    except Exception as e:
        logger.error(f"Chat stream failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
