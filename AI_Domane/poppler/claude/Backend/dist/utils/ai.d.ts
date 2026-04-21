/**
 * AI routing layer — dynamic Model + Solution routing.
 *
 * Primary path:  ALL requests → Python LangGraph service (port 8000)
 *                The LangGraph service handles solution routing (ESG RAG, Direct, etc.)
 *                and model routing (kimi-k2.5, GPT, Sonnet, etc.) internally.
 *
 * Fallback path: If the Python service is unavailable, fall back to direct LLM
 *                calls from Node.js (system prompt + selected model, no RAG).
 */
interface ChatMessage {
    role: string;
    content: string;
}
export declare function getAIResponse(messages: ChatMessage[], model?: string, solution?: string): Promise<string>;
export {};
