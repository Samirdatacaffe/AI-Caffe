/**
 * AI routing layer — dynamic Model + Solution routing with true streaming.
 *
 * Primary path:  ALL requests → Python LangGraph service (port 8000)
 *                The LangGraph service handles solution routing (ESG RAG, Direct, etc.)
 *                and model routing (kimi-k2.5, GPT, Sonnet, etc.) internally.
 *
 * Fallback path: If the Python service is unavailable, fall back to direct LLM
 *                calls from Node.js with real token-by-token streaming.
 */

interface ChatMessage {
  role: string;
  content: string;
}

const SERVICE_URL = process.env.ESG_API_URL || 'http://localhost:8000';

// ── Solution system prompts (used by direct fallback only) ──────────────────

const SOLUTION_PROMPTS: Record<string, string> = {
  'brew-generic-0.5':
    'You are AICaffe, a helpful and knowledgeable AI assistant. Provide clear, accurate, and concise answers.',
  'brew-esg-1.2':
    'You are AICaffe ESG Expert, specialized in Environmental, Social, and Governance (ESG) topics including sustainability reporting, BRSR, GHG emissions, materiality assessments, and ESG assurance standards. Provide expert-level analysis grounded in ESG frameworks.',
  'brew-ec-2.5':
    'You are AICaffe Election Analyst, specialized in election data analysis, polling trends, political landscape assessment, voter demographics, and electoral predictions. Provide data-driven, balanced political analysis.',
  'brew-dc-3.1':
    'You are AICaffe DataCaffe Analyst, specialized in data science, analytics, statistical modeling, data visualization, and business intelligence. Help users analyze data, build models, and derive actionable insights.',
};

// ── Model → API routing ─────────────────────────────────────────────────────

interface ModelConfig {
  apiUrl: string;
  apiKey: string;
  modelName: string;
  isAnthropic?: boolean;
}

function getModelConfig(model?: string): ModelConfig | null {
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

// ── Helper: parse SSE lines from a buffer ───────────────────────────────────

function parseSSELines(buffer: string): { lines: string[]; remaining: string } {
  const parts = buffer.split('\n');
  const remaining = parts.pop() || '';
  return { lines: parts, remaining };
}

// ── Helper: trim history to fit within context limits ───────────────────────
// Keeps the system message (if any) + the most recent messages within a char budget.
// Most models have ~8K–32K context; we budget ~24K chars (~6K tokens) for history.

const MAX_HISTORY_CHARS = 24000;
const MAX_HISTORY_MESSAGES = 30;

function trimHistory(messages: { role: string; content: string }[]): { role: string; content: string }[] {
  // Separate system messages from chat messages
  const system = messages.filter((m) => m.role === 'system');
  const chat = messages.filter((m) => m.role !== 'system');

  // Always keep the last message (the new user message)
  if (chat.length <= 2) return messages;

  // Trim to max message count first
  let trimmed = chat.length > MAX_HISTORY_MESSAGES
    ? chat.slice(chat.length - MAX_HISTORY_MESSAGES)
    : [...chat];

  // Then trim by total character count — remove oldest messages until under budget
  let totalChars = trimmed.reduce((sum, m) => sum + m.content.length, 0);
  while (totalChars > MAX_HISTORY_CHARS && trimmed.length > 2) {
    totalChars -= trimmed[0].content.length;
    trimmed.shift();
  }

  return [...system, ...trimmed];
}

// ── Main entry point (non-streaming — collects full response) ───────────────

export async function getAIResponse(
  messages: ChatMessage[],
  model?: string,
  solution?: string,
): Promise<string> {
  const modelId = model || 'kimi-k2.5';
  const solutionId = solution || 'brew-generic-0.5';

  console.log(`[AI] model=${modelId}, solution=${solutionId}`);

  // Primary: route through the Python LangGraph service
  try {
    return await callLangGraphService(messages, modelId, solutionId);
  } catch (err) {
    console.warn(`[AI] LangGraph service unavailable, using direct fallback. Error:`, err);
    return directFallback(messages, modelId, solutionId);
  }
}

// ── LangGraph service call (SSE streaming, collected into full response) ────

async function callLangGraphService(
  messages: ChatMessage[],
  model: string,
  solution: string,
): Promise<string> {
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
  if (!reader) throw new Error('No response body from LangGraph service');

  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSSELines(buffer);
    buffer = parsed.remaining;

    for (const line of parsed.lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const event = JSON.parse(trimmed.slice(6));

        if (event.type === 'token') {
          fullResponse += event.content;
        } else if (event.type === 'error') {
          throw new Error(event.content || 'LangGraph service error');
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  if (fullResponse.trim()) {
    return fullResponse.trim();
  }

  throw new Error('Empty response from LangGraph service');
}

// ── Direct LLM fallback (non-streaming) ─────────────────────────────────────

async function directFallback(
  messages: ChatMessage[],
  model: string,
  solution: string,
): Promise<string> {
  const config = getModelConfig(model);
  if (!config) {
    return noConfigResponse(model);
  }

  const systemPrompt = SOLUTION_PROMPTS[solution] || SOLUTION_PROMPTS['brew-generic-0.5'];
  const fullMessages = trimHistory([
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]);

  try {
    if (config.isAnthropic) {
      return await callAnthropic(config, fullMessages);
    }
    return await callOpenAICompatible(config, fullMessages);
  } catch (err) {
    console.error(`[AI Fallback Error] model=${config.modelName}:`, err);
    return `⚠️ Error calling **${model}**: ${err instanceof Error ? err.message : 'Unknown error'}\n\nPlease check the API configuration and try again.`;
  }
}

// ── OpenAI-compatible call (non-streaming) ──────────────────────────────────

async function callOpenAICompatible(
  config: ModelConfig,
  messages: { role: string; content: string }[],
): Promise<string> {
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
  const msg = data.choices?.[0]?.message;
  const reply = msg?.content || msg?.reasoning || '';
  if (reply) return reply;

  throw new Error('Empty response from API');
}

// ── Anthropic API call (non-streaming) ──────────────────────────────────────

async function callAnthropic(
  config: ModelConfig,
  messages: { role: string; content: string }[],
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

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

// ══════════════════════════════════════════════════════════════════════════════
// ── STREAMING — True token-by-token streaming to frontend via SSE ───────────
// ══════════════════════════════════════════════════════════════════════════════

export async function streamAIResponse(
  messages: ChatMessage[],
  model: string | undefined,
  solution: string | undefined,
  onEvent: (event: { type: string; content?: any }) => void,
): Promise<string> {
  const modelId = model || 'kimi-k2.5';
  const solutionId = solution || 'brew-generic-0.5';
  const lastMsg = messages[messages.length - 1]?.content || '';

  console.log(`[AI Stream] model=${modelId}, solution=${solutionId}`);

  // 1) Try LangGraph service first
  try {
    const res = await fetch(`${SERVICE_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: lastMsg,
        user_id: 'aicaffe-user',
        model: modelId,
        solution: solutionId,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) throw new Error(`LangGraph service returned HTTP ${res.status}`);

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSSELines(buffer);
      buffer = parsed.remaining;

      for (const line of parsed.lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const event = JSON.parse(trimmed.slice(6));
          onEvent(event);
          if (event.type === 'token') {
            fullResponse += event.content;
          }
        } catch {
          // skip malformed
        }
      }
    }

    return fullResponse.trim();
  } catch (err) {
    console.warn(`[AI Stream] LangGraph unavailable, streaming directly:`, err);
  }

  // 2) Direct streaming fallback — real token-by-token
  const config = getModelConfig(modelId);
  if (!config) {
    const msg = noConfigResponse(modelId);
    onEvent({ type: 'token', content: msg });
    onEvent({ type: 'done' });
    return msg;
  }

  const systemPrompt = SOLUTION_PROMPTS[solutionId] || SOLUTION_PROMPTS['brew-generic-0.5'];
  const fullMessages = trimHistory([
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]);

  try {
    if (config.isAnthropic) {
      return await streamAnthropic(config, fullMessages, onEvent);
    }
    return await streamOpenAICompatible(config, fullMessages, onEvent);
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Unknown error';
    // Provide a user-friendly error message
    let errMsg: string;
    if (raw.includes('500')) {
      errMsg = `⚠️ **${modelId}** encountered a server error. This usually means the conversation is too long for this model. Try starting a new chat or switching to a different model.`;
    } else if (raw.includes('429')) {
      errMsg = `⚠️ **${modelId}** is rate-limited. Please wait a moment and try again.`;
    } else {
      errMsg = `⚠️ Error calling **${modelId}**: ${raw}`;
    }
    console.error(`[AI Stream Fallback Error] model=${modelId}:`, raw);
    onEvent({ type: 'token', content: errMsg });
    onEvent({ type: 'done' });
    return errMsg;
  }
}

// ── OpenAI-compatible streaming (Ollama Cloud, OpenAI, etc.) ────────────────
//
// Protocol: server sends lines like  data: {"choices":[{"delta":{"content":"tok"}}]}
// Final line is  data: [DONE]

async function streamOpenAICompatible(
  config: ModelConfig,
  messages: { role: string; content: string }[],
  onEvent: (event: { type: string; content?: any }) => void,
): Promise<string> {
  console.log(`[AI Stream] Streaming from ${config.apiUrl} model=${config.modelName}`);

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
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${errText.substring(0, 300)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No stream body from API');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let hasContentTokens = false;
  // Track whether this model uses reasoning-only output (e.g. kimi-k2.5)
  let reasoningMode = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSSELines(buffer);
    buffer = parsed.remaining;

    for (const line of parsed.lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;

      const payload = trimmed.slice(6).trim();
      if (payload === '[DONE]') continue;

      try {
        const chunk = JSON.parse(payload);
        const delta = chunk.choices?.[0]?.delta;
        if (!delta) continue;

        // Content tokens — always stream immediately
        if (delta.content && delta.content !== '') {
          hasContentTokens = true;
          fullContent += delta.content;
          onEvent({ type: 'token', content: delta.content });
        }

        // Reasoning tokens (kimi-k2.5, qwen, etc.)
        const reasoning = delta.reasoning || delta.reasoning_content || '';
        if (reasoning) {
          if (!hasContentTokens) {
            // Model puts everything in reasoning (kimi-k2.5 style)
            // Stream reasoning tokens directly so user sees real-time output
            if (!reasoningMode) {
              reasoningMode = true;
              console.log(`[AI Stream] Model uses reasoning-only output, streaming reasoning tokens`);
            }
            fullContent += reasoning;
            onEvent({ type: 'token', content: reasoning });
          }
          // If content tokens exist, skip reasoning (it's internal chain-of-thought)
        }
      } catch {
        // skip malformed JSON chunks
      }
    }
  }

  console.log(`[AI Stream] ✓ OpenAI stream complete: ${fullContent.length} chars, reasoning-mode=${reasoningMode}`);
  onEvent({ type: 'done' });
  return fullContent.trim();
}

// ── Anthropic streaming ─────────────────────────────────────────────────────
//
// Protocol: server sends lines like  event: content_block_delta
//                                    data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"tok"}}
// And  event: message_stop  when done.

async function streamAnthropic(
  config: ModelConfig,
  messages: { role: string; content: string }[],
  onEvent: (event: { type: string; content?: any }) => void,
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  console.log(`[AI Stream] Streaming from Anthropic model=${config.modelName}`);

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
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${errText.substring(0, 300)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No stream body from Anthropic');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSSELines(buffer);
    buffer = parsed.remaining;

    for (const line of parsed.lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const chunk = JSON.parse(trimmed.slice(6));

        // content_block_delta → stream the text token
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          fullContent += chunk.delta.text;
          onEvent({ type: 'token', content: chunk.delta.text });
        }
      } catch {
        // skip malformed
      }
    }
  }

  onEvent({ type: 'done' });
  return fullContent.trim();
}

// ── No config fallback ──────────────────────────────────────────────────────

function noConfigResponse(model: string): string {
  return `⚠️ **${model}** is not configured.\n\nAdd the required API credentials to your \`.env\` file:\n\n- **kimi-k2.5 / qwen3-coder / mistral-large-3**: Set \`OLLAMA_API_KEY\` and \`OLLAMA_BASE_URL\`\n- **GPT**: Set \`OPENAI_API_KEY\` (or use Ollama)\n- **Sonnet 4.6**: Set \`ANTHROPIC_API_KEY\` (or use Ollama)`;
}
