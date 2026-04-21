"""
LangGraph pipeline — solution-aware routing and multi-step processing.

Graph topology:

  ┌────────┐
  │ route  │  decide pipeline from selected solution
  └───┬────┘
      │
  ┌───┴──────────┐
  │              │
  ▼              ▼
 ESG RAG       Direct
  │              │
  ├─ analyze     └── END
  ├─ retrieve
  ├─ draft
  └──── END

After the graph completes, AgentService streams the final answer
with the user-selected model via get_llm(model=...).
"""

from __future__ import annotations

from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.core.llm import get_llm
from app.modules.rag.tools.retriever_tool import RetrieverTool
from app.modules.rag.tools.esg_analyzer_tool import ESGAnalyzerTool
from app.modules.rag.repositories.vector_repository import VectorRepository
from app.modules.rag.services.prompt_service import PromptService
from app.utils.logger import logger


# ── Solution system prompts ──────────────────────────────

SOLUTION_PROMPTS: dict[str, str] = {
    "brew-generic-0.5": (
        "You are AICaffe, a helpful and knowledgeable AI assistant. "
        "Provide clear, accurate, and concise answers."
    ),
    "brew-esg-1.2": (
        "You are AICaffe ESG Expert, specialized in Environmental, Social, "
        "and Governance (ESG) topics including sustainability reporting, BRSR, "
        "GHG emissions, materiality assessments, and ESG assurance standards. "
        "Provide expert-level analysis grounded in ESG frameworks."
    ),
    "brew-ec-2.5": (
        "You are AICaffe Election Analyst, specialized in election data analysis, "
        "polling trends, political landscape assessment, voter demographics, "
        "and electoral predictions. Provide data-driven, balanced political analysis."
    ),
    "brew-dc-3.1": (
        "You are AICaffe DataCaffe Analyst, specialized in data science, analytics, "
        "statistical modeling, data visualization, and business intelligence. "
        "Help users analyze data, build models, and derive actionable insights."
    ),
}


# ── Skip-retrieval keywords ─────────────────────────────

_SKIP_RETRIEVAL = {
    "hello", "hi", "hey", "thanks", "thank you", "bye",
    "good morning", "good evening", "how are you",
}


# ── Pipeline state ───────────────────────────────────────

class PipelineState(TypedDict, total=False):
    question: str
    user_id: str
    model: str
    solution: str
    system_prompt: str
    context: str
    esg_analysis: str
    draft_answer: str
    pipeline: str          # "esg_rag" | "direct"


# ── Graph builder ────────────────────────────────────────

class PipelineGraph:
    """Owns the LangGraph pipeline and its tool/repo dependencies."""

    def __init__(self) -> None:
        self._vector_repo = VectorRepository()
        self._retriever_tool = RetrieverTool(self._vector_repo)
        self._esg_analyzer = ESGAnalyzerTool()
        self._prompt_service = PromptService()
        self._compiled = self._build()
        logger.info("LangGraph pipeline compiled successfully")

    # ── public accessors ─────────────────────────────────

    @property
    def compiled(self):
        """Return the compiled LangGraph runnable."""
        return self._compiled

    @property
    def prompt_service(self) -> PromptService:
        return self._prompt_service

    # ── node: route ──────────────────────────────────────

    def _route(self, state: PipelineState) -> dict:
        """Classify solution → choose pipeline + system prompt."""
        solution = state.get("solution", "brew-generic-0.5")
        pipeline = "esg_rag" if solution == "brew-esg-1.2" else "direct"
        prompt = SOLUTION_PROMPTS.get(solution, SOLUTION_PROMPTS["brew-generic-0.5"])
        logger.info(f"[Graph] route: solution={solution} → {pipeline}, model={state.get('model')}")
        return {"pipeline": pipeline, "system_prompt": prompt}

    # ── node: ESG analyse (rule-based, fast) ─────────────

    def _esg_analyze(self, state: PipelineState) -> dict:
        analysis = self._esg_analyzer.run(state["question"])
        logger.info(f"[Graph] esg_analyze: {len(analysis)} chars")
        return {"esg_analysis": analysis}

    # ── node: retrieve chunks from ChromaDB ──────────────

    def _retrieve(self, state: PipelineState) -> dict:
        q = state["question"]
        q_lower = q.strip().lower().rstrip("?!.")
        if q_lower in _SKIP_RETRIEVAL or len(q.split()) < 3:
            logger.info("[Graph] retrieve: skipped (greeting / short query)")
            return {"context": ""}
        context = self._retriever_tool.run(q, state.get("user_id", "anon"))
        logger.info(f"[Graph] retrieve: {len(context)} chars, user={state.get('user_id')}")
        return {"context": context}

    # ── node: draft answer (async — calls LLM) ──────────

    async def _draft(self, state: PipelineState) -> dict:
        ctx = state.get("context", "")
        if not ctx or ctx == "No relevant documents found in the knowledge base.":
            return {"draft_answer": ""}
        prompt = self._prompt_service.build_draft(state["question"], ctx)
        llm = get_llm(streaming=False, model=state.get("model"))
        result = await llm.ainvoke(prompt)
        logger.info(f"[Graph] draft: {len(result.content)} chars via {state.get('model')}")
        return {"draft_answer": result.content}

    # ── node: prepare direct (no RAG needed) ─────────────

    @staticmethod
    def _prepare_direct(state: PipelineState) -> dict:
        """Set empty RAG fields for non-ESG solutions."""
        return {"context": "", "esg_analysis": "", "draft_answer": ""}

    # ── graph assembly ───────────────────────────────────

    def _build(self):
        g = StateGraph(PipelineState)

        # Register nodes
        g.add_node("route", self._route)
        g.add_node("esg_analyze", self._esg_analyze)
        g.add_node("retrieve", self._retrieve)
        g.add_node("draft", self._draft)
        g.add_node("prepare_direct", self._prepare_direct)

        # Entry
        g.set_entry_point("route")

        # Conditional routing: ESG RAG vs Direct
        g.add_conditional_edges(
            "route",
            lambda s: s["pipeline"],
            {"esg_rag": "esg_analyze", "direct": "prepare_direct"},
        )

        # ESG RAG chain: analyze → retrieve → draft → END
        g.add_edge("esg_analyze", "retrieve")
        g.add_edge("retrieve", "draft")
        g.add_edge("draft", END)

        # Direct chain: prepare → END
        g.add_edge("prepare_direct", END)

        return g.compile()
