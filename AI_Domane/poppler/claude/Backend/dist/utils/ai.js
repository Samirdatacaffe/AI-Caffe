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
const SERVICE_URL = process.env.ESG_API_URL || 'http://localhost:8000';
// ── Solution system prompts (used by direct fallback only) ──────────────────
const SOLUTION_PROMPTS = {
    'brew-generic-0.5': 'You are AICaffe, a helpful and knowledgeable AI assistant. Provide clear, accurate, and concise answers.',
    'brew-esg-1.2': 'You are AICaffe ESG Expert, specialized in Environmental, Social, and Governance (ESG) topics including sustainability reporting, BRSR, GHG emissions, materiality assessments, and ESG assurance standards. Provide expert-level analysis grounded in ESG frameworks.',
    'brew-ec-2.5': 'You are AICaffe Election Analyst, specialized in election data analysis, polling trends, political landscape assessment, voter demographics, and electoral predictions. Provide data-driven, balanced political analysis.',
    'brew-dc-3.1': 'You are AICaffe DataCaffe Analyst, specialized in data science, analytics, statistical modeling, data visualization, and business intelligence. Help users analyze data, build models, and derive actionable insights.',
};
function getModelConfig(model) {
    const ollamaKey = process.env.OLLAMA_API_KEY;
    const ollamaBase = (process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1').replace(/\/+$/, '');
    const modelId = model || 'kimi-k2.5';
    // Sonnet 4.6 → prefer Anthropic API if key available
    if (modelId === 'sonnet-4.6' && process.env.ANTHROPIC_API_KEY) {
        return {
            apiUrl: 'https://api.anthropic.com/v1/messages',
            apiKey: process.env.ANTHROPIC_API_KEY,
            modelName: 'claude-sonnet-4-6',
            isAnthropic: true,
        };
    }
    // GPT → prefer OpenAI API if key available
    if (modelId === 'gpt' && process.env.OPENAI_API_KEY) {
        return {
            apiUrl: 'https://api.openai.com/v1/chat/completions',
            apiKey: process.env.OPENAI_API_KEY,
            modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        };
    }
    // All models route through Ollama Cloud (OpenAI-compatible endpoint)
    if (ollamaKey) {
        return {
            apiUrl: `${ollamaBase}/chat/completions`,
            apiKey: ollamaKey,
            modelName: modelId,
        };
    }
    return null;
}
// ── Main entry point ────────────────────────────────────────────────────────
export async function getAIResponse(messages, model, solution) {
    const modelId = model || 'kimi-k2.5';
    const solutionId = solution || 'brew-generic-0.5';
    console.log(`[AI] model=${modelId}, solution=${solutionId}`);
    // Primary: route through the Python LangGraph service
    try {
        return await callLangGraphService(messages, modelId, solutionId);
    }
    catch (err) {
        console.warn(`[AI] LangGraph service unavailable, using direct fallback. Error:`, err);
        return directFallback(messages, modelId, solutionId);
    }
}
// ── LangGraph service call (SSE streaming, collected into full response) ────
async function callLangGraphService(messages, model, solution) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    console.log(`[AI] → LangGraph service at ${SERVICE_URL} | model=${model}, solution=${solution}`);
    const res = await fetch(`${SERVICE_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            question: lastMsg,
            user_id: 'aicaffe-user',
            model,
            solution,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
    });
    if (!res.ok) {
        throw new Error(`LangGraph service returned HTTP ${res.status}`);
    }
    const reader = res.body?.getReader();
    if (!reader)
        throw new Error('No response body from LangGraph service');
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: '))
                continue;
            try {
                const event = JSON.parse(trimmed.slice(6));
                if (event.type === 'token') {
                    fullResponse += event.content;
                }
                else if (event.type === 'done') {
                    // Stream finished
                }
                else if (event.type === 'error') {
                    throw new Error(event.content || 'LangGraph service error');
                }
                // Ignore 'status' and 'sources' events (informational)
            }
            catch {
                // Skip malformed JSON lines
            }
        }
    }
    if (fullResponse.trim()) {
        return fullResponse.trim();
    }
    throw new Error('Empty response from LangGraph service');
}
// ── Direct LLM fallback (when Python service is unavailable) ────────────────
async function directFallback(messages, model, solution) {
    const config = getModelConfig(model);
    if (!config) {
        return noConfigResponse(model);
    }
    const systemPrompt = SOLUTION_PROMPTS[solution] || SOLUTION_PROMPTS['brew-generic-0.5'];
    const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];
    try {
        if (config.isAnthropic) {
            return await callAnthropic(config, fullMessages);
        }
        return await callOpenAICompatible(config, fullMessages);
    }
    catch (err) {
        console.error(`[AI Fallback Error] model=${config.modelName}:`, err);
        return `⚠️ Error calling **${model}**: ${err instanceof Error ? err.message : 'Unknown error'}\n\nPlease check the API configuration and try again.`;
    }
}
// ── OpenAI-compatible call (Ollama Cloud, OpenAI, etc.) ─────────────────────
async function callOpenAICompatible(config, messages) {
    console.log(`[AI] Calling ${config.apiUrl} with model=${config.modelName}`);
    const res = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.modelName,
            messages,
            max_tokens: 2048,
        }),
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errText.substring(0, 300)}`);
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply)
        return reply;
    throw new Error('Empty response from API');
}
// ── Anthropic API call ──────────────────────────────────────────────────────
async function callAnthropic(config, messages) {
    const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
    const chatMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));
    console.log(`[AI] Calling Anthropic API with model=${config.modelName}`);
    const res = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: config.modelName,
            system: systemMsg,
            messages: chatMessages,
            max_tokens: 2048,
        }),
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Anthropic ${res.status}: ${errText.substring(0, 300)}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || '';
}
// ── No config fallback ──────────────────────────────────────────────────────
function noConfigResponse(model) {
    return `⚠️ **${model}** is not configured.\n\nAdd the required API credentials to your \`.env\` file:\n\n- **kimi-k2.5 / qwen3-coder / mistral-large-3**: Set \`OLLAMA_API_KEY\` and \`OLLAMA_BASE_URL\`\n- **GPT**: Set \`OPENAI_API_KEY\` (or use Ollama)\n- **Sonnet 4.6**: Set \`ANTHROPIC_API_KEY\` (or use Ollama)`;
}
