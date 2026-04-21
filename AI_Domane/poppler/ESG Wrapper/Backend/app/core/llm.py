"""
LLM factory — routes to the correct provider based on the selected model:
  • gpt         → OpenAI API   (if OPENAI_API_KEY is set)
  • sonnet-4.6  → Anthropic API (if ANTHROPIC_API_KEY is set)
  • *           → Ollama Cloud  (OpenAI-compatible /v1 endpoint)
"""

from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel
from app.core.config import settings


def get_llm(streaming: bool = True, callbacks: list | None = None, model: str | None = None) -> BaseChatModel:
    """Build and return an LLM instance routed to the correct provider."""
    model_id = model or settings.OLLAMA_LLM_MODEL

    # Sonnet 4.6 → Anthropic API (if key available)
    if model_id == 'sonnet-4.6' and settings.ANTHROPIC_API_KEY:
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model='claude-sonnet-4-6',
            anthropic_api_key=settings.ANTHROPIC_API_KEY,
            streaming=streaming,
            temperature=settings.LLM_TEMPERATURE,
            callbacks=callbacks,
        )

    # GPT → OpenAI API (if key available)
    if model_id == 'gpt' and settings.OPENAI_API_KEY:
        return ChatOpenAI(
            model=settings.OPENAI_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            openai_api_base='https://api.openai.com/v1',
            streaming=streaming,
            temperature=settings.LLM_TEMPERATURE,
            callbacks=callbacks,
        )

    # Default: all other models via Ollama Cloud
    return ChatOpenAI(
        model=model_id,
        openai_api_key=settings.OLLAMA_API_KEY,
        openai_api_base=settings.OLLAMA_BASE_URL,
        streaming=streaming,
        temperature=settings.LLM_TEMPERATURE,
        callbacks=callbacks,
    )
