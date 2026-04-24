from __future__ import annotations
"""
Agent service — LangGraph orchestrator with per-model streaming.

Flow:
  1. Run the LangGraph pipeline (route → ESG RAG or Direct)
  2. Build the final prompt from the pipeline state
  3. Stream the final answer token-by-token via SSE using the selected model
  4. Save conversation to memory
"""

import asyncio
import json
from typing import AsyncIterator

from langchain.callbacks import AsyncIteratorCallbackHandler

from app.core.llm import get_llm
from app.modules.rag.services.router import PipelineGraph, SOLUTION_PROMPTS
from app.modules.rag.repositories.memory_repository import MemoryRepository
from app.utils.logger import logger


# ── SSE helper ───────────────────────────────────────────

def _sse(event_type: str, content=None) -> str:
    """Format a single SSE data line."""
    payload: dict = {"type": event_type}
    if content is not None:
        payload["content"] = content
    return f"data: {json.dumps(payload)}\n\n"


class AgentService:
    """Agentic orchestrator — LangGraph routing + token streaming."""

    def __init__(self) -> None:
        self._graph = PipelineGraph()
        self._memory_repo = MemoryRepository()
        logger.info("AgentService initialised (LangGraph)")

    # ── main entry point ─────────────────────────────────

    async def run(
        self,
        question: str,
        user_id: str,
        model: str | None = None,
        solution: str | None = None,
        messages: list[dict] | None = None,
    ) -> AsyncIterator[str]:
        """Execute the full pipeline and stream the final answer."""
        model_id = model or "kimi-k2.5"
        solution_id = solution or "brew-generic-0.5"

        logger.info(
            f"Agent.run() — user={user_id}, model={model_id}, solution={solution_id}"
        )

        # ── Step 1: Run LangGraph pipeline (non-streaming) ─
        yield _sse("status", f"Routing to {solution_id} pipeline...")

        state = await self._graph.compiled.ainvoke({
            "question": question,
            "user_id": user_id,
            "model": model_id,
            "solution": solution_id,
        })

        pipeline = state.get("pipeline", "direct")
        context = state.get("context", "")
        esg_analysis = state.get("esg_analysis", "")
        draft_answer = state.get("draft_answer", "")
        system_prompt = state.get(
            "system_prompt", SOLUTION_PROMPTS["brew-generic-0.5"]
        )

        # ── Step 2: Load chat history ──────────────────────
        chat_history = self._memory_repo.get_recent_messages(user_id)

        # ── Step 3: Build final prompt ─────────────────────
        if pipeline == "esg_rag":
            yield _sse("status", "Refining final answer...")
            final_prompt = self._graph.prompt_service.build_refine(
                question=question,
                context=context,
                draft_answer=draft_answer,
                esg_analysis=esg_analysis,
                chat_history=chat_history,
            )
        else:
            yield _sse("status", f"Generating with {model_id}...")
            final_prompt = self._build_direct_prompt(
                system_prompt, question, messages, chat_history,
            )

        # ── Step 4: Stream final answer ────────────────────
        callback = AsyncIteratorCallbackHandler()
        llm = get_llm(streaming=True, callbacks=[callback], model=model_id)

        result_holder: dict = {}

        async def _invoke():
            result = await llm.ainvoke(final_prompt)
            result_holder["content"] = result.content

        task = asyncio.create_task(_invoke())

        try:
            async for token in callback.aiter():
                yield _sse("token", token)
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield _sse("error", str(e))

        await task

        # ── Step 5: Save to memory ─────────────────────────
        full_answer = result_holder.get("content", "")
        memory = self._memory_repo.get_memory(user_id)
        memory.save_context(
            {"input": question},
            {"answer": full_answer},
        )

        # ── Step 6: Source documents (ESG RAG only) ────────
        sources: list[dict] = []
        if (
            pipeline == "esg_rag"
            and context
            and context != "No relevant documents found in the knowledge base."
        ):
            for i, block in enumerate(context.split("\n\n---\n\n"), 1):
                sources.append({"chunk": i, "preview": block[:300]})

        yield _sse("sources", sources)
        yield _sse("done")

        logger.info(
            f"Agent complete — pipeline={pipeline}, model={model_id}, "
            f"sources={len(sources)}"
        )

    # ── helpers ───────────────────────────────────────────

    @staticmethod
    def _build_direct_prompt(
        system_prompt: str,
        question: str,
        messages: list[dict] | None,
        chat_history: list[dict],
    ) -> str:
        """Build a prompt for non-RAG (direct) solutions."""
        parts = [system_prompt, ""]

        # Prefer passed-in messages for conversation context,
        # fall back to memory-based history
        if messages and len(messages) > 1:
            history_lines = []
            for msg in messages[:-1]:
                role = "User" if msg.get("role") == "user" else "Assistant"
                history_lines.append(f"{role}: {msg.get('content', '')}")
            if history_lines:
                parts.append("--- CONVERSATION HISTORY ---")
                parts.append("\n".join(history_lines))
                parts.append("")
        elif chat_history:
            history_lines = []
            for msg in chat_history[-10:]:
                role = "User" if msg["role"] == "human" else "Assistant"
                history_lines.append(f"{role}: {msg['content']}")
            if history_lines:
                parts.append("--- CONVERSATION HISTORY ---")
                parts.append("\n".join(history_lines))
                parts.append("")

        parts.append(f"--- USER QUESTION ---\n{question}\n")
        parts.append("--- YOUR RESPONSE ---\n")
        return "\n".join(parts)
