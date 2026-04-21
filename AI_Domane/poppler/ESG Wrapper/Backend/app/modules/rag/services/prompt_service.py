"""
Prompt Builder — assembles prompts for the two-pass LLM pipeline.

Pass 1 (Draft):  chunks + question → initial answer
Pass 2 (Refine): chunks + question + draft answer → polished final answer

The LLM sees ALL retrieved chunks and decides which are relevant.
"""

from app.utils.logger import logger

# ── Pass 1: Draft prompt ────────────────────────────────

_DRAFT_RULES = """\
You are an ESG assurance expert assistant powered by ESGCaffe.

You are given 5 retrieved document chunks and a user question.
Your job is to produce a DRAFT answer.

RULES:
1. Read ALL chunks carefully. Decide which chunks are relevant to the question.
2. Answer ONLY using information from the relevant chunks.
3. Cite which chunk (Source 1, Source 2, etc.) you used for each point.
4. If none of the chunks answer the question, say so clearly.
5. Be thorough — include all relevant details from the chunks.
"""

# ── Pass 2: Refine prompt ──────────────────────────────

_REFINE_RULES = """\
You are an ESG assurance expert assistant powered by ESGCaffe.

You are given:
  - The original user question
  - All 5 retrieved document chunks
  - A draft answer that was generated from those chunks
  - ESG standards analysis
  - Chat history for context

Your job is to produce the FINAL polished answer.

RULES:
1. Review the draft answer against the original chunks for accuracy.
2. Fix any errors, fill in missing details, and remove irrelevant information.
3. Keep source citations (Source 1, Source 2, etc.) — correct them if wrong.
4. Structure the answer clearly with bullet points or sections.
5. Be detailed but concise — no fluff.
6. If the draft is already excellent, keep it as-is with minor polish.
7. Do NOT hallucinate — only use information present in the chunks.
"""


class PromptService:
    """Builds prompts for the two-pass draft → refine pipeline."""

    def build_draft(self, question: str, context: str) -> str:
        """Pass 1: Generate a draft answer from chunks + question."""
        logger.debug("PromptService.build_draft()")

        return f"""{_DRAFT_RULES}

--- RETRIEVED CHUNKS (all 5) ---
{context or "(no documents retrieved)"}

--- USER QUESTION ---
{question}

--- DRAFT ANSWER ---
"""

    def build_refine(
        self,
        question: str,
        context: str,
        draft_answer: str,
        esg_analysis: str,
        chat_history: list[dict],
    ) -> str:
        """Pass 2: Refine the draft into a polished final answer."""
        logger.debug("PromptService.build_refine()")

        # Format chat history
        history_block = ""
        if chat_history:
            lines = []
            for msg in chat_history[-10:]:
                role = "User" if msg["role"] == "human" else "Assistant"
                lines.append(f"{role}: {msg['content']}")
            history_block = "\n".join(lines)

        return f"""{_REFINE_RULES}

--- CHAT HISTORY ---
{history_block or "(no prior conversation)"}

--- ESG STANDARDS ANALYSIS ---
{esg_analysis or "(no specific standards matched)"}

--- RETRIEVED CHUNKS (all 5) ---
{context or "(no documents retrieved)"}

--- USER QUESTION ---
{question}

--- DRAFT ANSWER ---
{draft_answer}

--- YOUR FINAL POLISHED ANSWER ---
"""
