/**
 * Conversation summarization utility.
 *
 * When a user switches models mid-conversation, this module generates a
 * concise summary of the previous conversation so the new model has context.
 * It uses the same AI routing layer (getAIResponse) to produce the summary.
 */

import { getAIResponse } from './ai.js';

interface ChatMessage {
  role: string;
  content: string;
}

const SUMMARIZE_SYSTEM_PROMPT = `You are a conversation summarizer. Given a conversation between a user and an AI assistant, produce a concise summary that captures:
1. The main topics discussed
2. Key questions asked and answers given
3. Any decisions, conclusions, or action items
4. Important context the user provided (preferences, constraints, etc.)

Keep the summary under 500 words. Write in third person ("The user asked about...", "The assistant explained..."). Focus on information that would help a different AI assistant continue the conversation seamlessly.`;

const AUTO_SUMMARIZE_THRESHOLD = 10; // Auto-summarize when history exceeds this many messages

/**
 * Generate a summary of the conversation messages.
 * Uses the specified model (or falls back to default) to create the summary.
 */
export async function generateSummary(
  messages: ChatMessage[],
  model?: string,
  solution?: string,
): Promise<string> {
  if (messages.length === 0) return '';

  // Build a transcript of the conversation
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const summaryRequest: ChatMessage[] = [
    { role: 'system', content: SUMMARIZE_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Please summarize the following conversation:\n\n${transcript}`,
    },
  ];

  return getAIResponse(summaryRequest, model, solution);
}

/**
 * Check if a model switch has occurred by comparing the new model
 * with the conversation's last used model.
 */
export function isModelSwitch(
  lastModel: string | null | undefined,
  newModel: string,
): boolean {
  if (!lastModel) return false; // First message — no switch
  return lastModel !== newModel;
}

/**
 * Build the context messages for a new model after a switch.
 * Prepends a system message with the conversation summary so the new model
 * understands what happened before.
 */
export function buildSwitchContext(
  summary: string,
  previousModel: string,
  newModel: string,
): ChatMessage {
  return {
    role: 'system',
    content: `[Model Switch Context] The user has switched from ${previousModel} to ${newModel}. Here is a summary of the previous conversation:\n\n${summary}\n\nPlease continue the conversation naturally, using this context to provide relevant and consistent responses.`,
  };
}

/**
 * Check if conversation is long enough to benefit from auto-summarization.
 */
export function shouldAutoSummarize(messageCount: number): boolean {
  return messageCount >= AUTO_SUMMARIZE_THRESHOLD;
}
