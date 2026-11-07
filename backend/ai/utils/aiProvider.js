/**
 * HelpJi AI Provider Abstraction
 *
 * Provides a unified interface for calling AI language models.
 * Currently supports: OpenAI (default), Anthropic, Google Gemini.
 *
 * Configure via environment variables:
 *   AI_PROVIDER=openai|google|anthropic
 *   AI_API_KEY=<your key>
 *   AI_MODEL=gpt-4o-mini|gemini-1.5-flash|claude-haiku-20240307
 *
 * AI failures NEVER crash the calling service — always returns a fallback.
 */

import logger from '../../utils/logger.js';
import env from '../../config/env.js';

/**
 * AI provider configuration
 */
const AI_PROVIDER = env.ai?.provider || process.env.AI_PROVIDER || 'openai';
const AI_API_KEY = env.ai?.apiKey || process.env.AI_API_KEY || '';
const AI_MODEL = env.ai?.model || process.env.AI_MODEL || 'gpt-4o-mini';

/**
 * Flag: AI is available only if an API key is configured.
 */
export const isAiAvailable = () => Boolean(AI_API_KEY && AI_API_KEY.length > 10);

/**
 * Call the configured AI provider with a prompt.
 *
 * @param {string} systemPrompt - System instructions
 * @param {string} userMessage - User input
 * @param {Object} options - { maxTokens, temperature, jsonMode }
 * @returns {Promise<string>} AI response text, or null on failure
 */
export async function callAI(systemPrompt, userMessage, options = {}) {
  if (!isAiAvailable()) {
    logger.warn('[AI] No AI API key configured — AI unavailable');
    return null;
  }

  const { maxTokens = 1000, temperature = 0.3, jsonMode = false } = options;

  try {
    switch (AI_PROVIDER.toLowerCase()) {
      case 'openai':
        return await callOpenAI(systemPrompt, userMessage, { maxTokens, temperature, jsonMode });
      case 'google':
        return await callGemini(systemPrompt, userMessage, { maxTokens, temperature });
      case 'anthropic':
        return await callAnthropic(systemPrompt, userMessage, { maxTokens, temperature });
      default:
        logger.warn(`[AI] Unknown provider: ${AI_PROVIDER}. Falling back to OpenAI.`);
        return await callOpenAI(systemPrompt, userMessage, { maxTokens, temperature, jsonMode });
    }
  } catch (error) {
    logger.error('[AI] Provider call failed', { error: error.message, provider: AI_PROVIDER });
    return null;
  }
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

async function callOpenAI(systemPrompt, userMessage, { maxTokens, temperature, jsonMode }) {
  const body = {
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

// ── Google Gemini ─────────────────────────────────────────────────────────────

async function callGemini(systemPrompt, userMessage, { maxTokens, temperature }) {
  const model = AI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${AI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\n${userMessage}` },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini error ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

// ── Anthropic Claude ──────────────────────────────────────────────────────────

async function callAnthropic(systemPrompt, userMessage, { maxTokens, temperature }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_MODEL || 'claude-haiku-20240307',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() || null;
}

export default { callAI, isAiAvailable };
