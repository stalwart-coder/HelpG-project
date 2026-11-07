/**
 * HelpJi AI Matching Service
 *
 * Provides AI-powered:
 *  1. Task description enhancement (auto-improve customer task descriptions)
 *  2. Smart helper ranking (AI score for helper-task compatibility)
 *  3. Price estimation (AI-based price range suggestion)
 *  4. Booking risk detection (flag potentially problematic bookings)
 *
 * All operations degrade gracefully — if AI is unavailable, returns null and
 * the caller falls back to the existing rule-based logic.
 */

import { callAI, isAiAvailable } from '../utils/aiProvider.js';
import User from '../../models/User.js';
import Booking from '../../models/Booking.js';
import HelperProfile from '../../models/HelperProfile.js';
import logger from '../../utils/logger.js';

// ── System Prompts ───────────────────────────────────────────────────────────

const TASK_ENHANCEMENT_PROMPT = `You are an expert at writing clear, professional service requests for a home services marketplace in India called HelpJi.

Your job is to improve a customer's task description to:
1. Be clear and actionable for service providers
2. Include relevant details that may have been missed
3. Use polite, professional language
4. Stay concise (under 200 words)

Do NOT:
- Add information that wasn't implied by the original
- Change the fundamental nature of the task
- Use English jargon — keep it accessible

Return ONLY the improved description text. No commentary, no formatting, no prefix like "Improved:".`;

const PRICE_ESTIMATION_PROMPT = `You are a pricing expert for home services in Indian cities (Mumbai, Delhi, Bangalore, etc.).

Given a task category, description, and city, estimate a fair price range in Indian Rupees (₹).

Respond with ONLY a valid JSON object in this exact format:
{
  "minPrice": <number>,
  "maxPrice": <number>,
  "suggestedPrice": <number>,
  "priceUnit": "per_task" | "per_hour" | "per_item",
  "rationale": "<one sentence explaining the price>"
}

Base your estimates on typical Indian household service rates (2024-2025). Be realistic — don't over-estimate.`;

const HELPER_RANKING_PROMPT = `You are a matching algorithm for HelpJi, a home services marketplace in India.

Given a task description and a list of helper profiles, rank the helpers from BEST to WORST match.

Consider:
- Skill match (most important)
- Service area proximity
- Rating and reliability
- Availability
- Specializations

Respond with ONLY a valid JSON array of helper IDs ordered from best to worst match:
["helper_id_1", "helper_id_2", ...]

Return ONLY the JSON array, no explanation.`;

const BOOKING_RISK_PROMPT = `You are a fraud and safety detection system for HelpJi, a home services platform in India.

Analyze the following booking request and identify any potential risks or red flags.

Risk categories:
- "safe" — normal booking, no concerns
- "low_risk" — minor concerns, proceed with monitoring
- "medium_risk" — notable concerns, may need verification
- "high_risk" — serious red flags, requires manual review

Respond with ONLY a valid JSON object:
{
  "riskLevel": "safe" | "low_risk" | "medium_risk" | "high_risk",
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendation": "<brief action recommendation>"
}`;

// ── Service Functions ─────────────────────────────────────────────────────────

/**
 * Enhance a customer's task description using AI.
 *
 * @param {string} originalDescription - Raw customer input
 * @param {string} category - Service category
 * @param {string} [city] - City for context
 * @returns {Promise<{enhanced: string, original: string, aiUsed: boolean}>}
 */
export async function enhanceTaskDescription(originalDescription, category, city = '') {
  if (!originalDescription || originalDescription.trim().length < 10) {
    return { enhanced: originalDescription, original: originalDescription, aiUsed: false };
  }

  if (!isAiAvailable()) {
    return { enhanced: originalDescription, original: originalDescription, aiUsed: false };
  }

  try {
    const userMessage = `Task category: ${category}
City: ${city || 'India'}

Original description: "${originalDescription}"

Please improve this task description.`;

    const enhanced = await callAI(TASK_ENHANCEMENT_PROMPT, userMessage, {
      maxTokens: 300,
      temperature: 0.4,
    });

    if (!enhanced) {
      return { enhanced: originalDescription, original: originalDescription, aiUsed: false };
    }

    logger.info('[AI] Task description enhanced', { category, city });
    return { enhanced: enhanced.trim(), original: originalDescription, aiUsed: true };
  } catch (error) {
    logger.warn('[AI] Task enhancement failed, using original', { error: error.message });
    return { enhanced: originalDescription, original: originalDescription, aiUsed: false };
  }
}

/**
 * Estimate a fair price range for a service.
 *
 * @param {string} category - Service category
 * @param {string} description - Task description
 * @param {string} [city] - City for regional pricing
 * @returns {Promise<{minPrice, maxPrice, suggestedPrice, priceUnit, rationale, aiUsed}>}
 */
export async function estimatePrice(category, description, city = 'Mumbai') {
  const fallback = {
    minPrice: null,
    maxPrice: null,
    suggestedPrice: null,
    priceUnit: 'per_task',
    rationale: null,
    aiUsed: false,
  };

  if (!isAiAvailable()) return fallback;

  try {
    const userMessage = `Category: ${category}
Description: ${description}
City: ${city}

Estimate the fair price range for this home service task.`;

    const response = await callAI(PRICE_ESTIMATION_PROMPT, userMessage, {
      maxTokens: 200,
      temperature: 0.2,
      jsonMode: true,
    });

    if (!response) return fallback;

    const parsed = JSON.parse(response);
    logger.info('[AI] Price estimated', { category, city, suggestedPrice: parsed.suggestedPrice });

    return { ...parsed, aiUsed: true };
  } catch (error) {
    logger.warn('[AI] Price estimation failed', { error: error.message });
    return fallback;
  }
}

/**
 * Rank helpers by AI-computed compatibility with a booking.
 *
 * @param {string} bookingId - Booking to match
 * @param {Array<string>} helperIds - Candidate helper IDs
 * @returns {Promise<{rankedHelperIds: Array<string>, aiUsed: boolean}>}
 */
export async function rankHelpersForBooking(bookingId, helperIds) {
  const fallback = { rankedHelperIds: helperIds, aiUsed: false };

  if (!isAiAvailable() || helperIds.length === 0) return fallback;

  try {
    const [booking, helpers] = await Promise.all([
      Booking.findById(bookingId).lean(),
      HelperProfile.find({ userId: { $in: helperIds } })
        .populate('userId', 'name')
        .lean(),
    ]);

    if (!booking || helpers.length === 0) return fallback;

    const helperSummaries = helpers.map((h) => ({
      id: h.userId._id.toString(),
      name: h.userId.name,
      skills: h.skills || [],
      rating: h.averageRating || 0,
      totalJobs: h.totalCompletedTasks || 0,
      bio: h.bio || '',
    }));

    const userMessage = `Task: "${booking.title}"
Category: ${booking.category}
Description: ${booking.description || 'Not provided'}
Location: ${booking.location}

Available helpers:
${JSON.stringify(helperSummaries, null, 2)}

Rank these helpers from best to worst match. Return ONLY the JSON array of IDs.`;

    const response = await callAI(HELPER_RANKING_PROMPT, userMessage, {
      maxTokens: 200,
      temperature: 0.1,
      jsonMode: false,
    });

    if (!response) return fallback;

    // Parse ranked IDs
    const rankedIds = JSON.parse(response);
    if (!Array.isArray(rankedIds)) return fallback;

    // Validate: only include IDs that were in the original list
    const validIds = rankedIds.filter((id) => helperIds.includes(id));
    // Append any helpers that AI didn't include (safety fallback)
    const missing = helperIds.filter((id) => !validIds.includes(id));

    logger.info('[AI] Helper ranking complete', { bookingId, rankedCount: validIds.length });
    return { rankedHelperIds: [...validIds, ...missing], aiUsed: true };
  } catch (error) {
    logger.warn('[AI] Helper ranking failed, using original order', { error: error.message });
    return fallback;
  }
}

/**
 * Assess booking risk level.
 *
 * @param {Object} bookingData - { title, description, category, price, location, customerId }
 * @returns {Promise<{riskLevel, concerns, recommendation, aiUsed}>}
 */
export async function assessBookingRisk(bookingData) {
  const fallback = {
    riskLevel: 'safe',
    concerns: [],
    recommendation: 'Proceed normally.',
    aiUsed: false,
  };

  if (!isAiAvailable()) return fallback;

  try {
    const userMessage = `Booking Request:
Title: ${bookingData.title}
Category: ${bookingData.category}
Description: ${bookingData.description || 'Not provided'}
Price: ₹${bookingData.price}
Location: ${bookingData.location}

Assess the risk level of this booking.`;

    const response = await callAI(BOOKING_RISK_PROMPT, userMessage, {
      maxTokens: 200,
      temperature: 0.1,
      jsonMode: true,
    });

    if (!response) return fallback;

    const parsed = JSON.parse(response);
    if (parsed.riskLevel === 'high_risk') {
      logger.warn('[AI] High-risk booking detected', { title: bookingData.title });
    }

    return { ...parsed, aiUsed: true };
  } catch (error) {
    logger.warn('[AI] Risk assessment failed', { error: error.message });
    return fallback;
  }
}

/**
 * Generate a contextual chat suggestion for a helper based on booking details.
 *
 * @param {Object} context - { bookingTitle, customerMessage, category }
 * @returns {Promise<{suggestion: string|null, aiUsed: boolean}>}
 */
export async function generateChatSuggestion(context) {
  if (!isAiAvailable()) return { suggestion: null, aiUsed: false };

  try {
    const systemPrompt = `You are helping a professional home service provider in India respond to customer messages.
Generate a single, polite, professional, and concise response message (under 60 words).
The message should be in English but may include common Hindi phrases like "Namaste" or "Ji haan".
Do NOT use any formatting — just plain text.`;

    const userMessage = `Booking: ${context.bookingTitle} (${context.category})
Customer says: "${context.customerMessage}"

Write an appropriate response for the service provider to send.`;

    const suggestion = await callAI(systemPrompt, userMessage, {
      maxTokens: 100,
      temperature: 0.6,
    });

    return { suggestion: suggestion?.trim() || null, aiUsed: !!suggestion };
  } catch (error) {
    logger.warn('[AI] Chat suggestion failed', { error: error.message });
    return { suggestion: null, aiUsed: false };
  }
}

export default {
  enhanceTaskDescription,
  estimatePrice,
  rankHelpersForBooking,
  assessBookingRisk,
  generateChatSuggestion,
};
