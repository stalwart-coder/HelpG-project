/**
 * AI Controller — REST endpoints for HelpJi AI features
 *
 * All endpoints gracefully degrade: if AI is unavailable, they return
 * a structured response with aiUsed: false rather than failing.
 */

import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { isAiAvailable } from '../utils/aiProvider.js';
import * as matchingService from '../services/matchingService.js';

/**
 * GET /api/ai/status
 * Check if AI is available and configured.
 */
export const getAiStatus = asyncHandler(async (req, res) => {
  res.json(
    new ApiResponse(200, {
      available: isAiAvailable(),
      features: ['task-enhancement', 'price-estimation', 'helper-ranking', 'risk-assessment', 'chat-suggestions'],
    }, 'AI status')
  );
});

/**
 * POST /api/ai/enhance-task
 * Improve a customer's task description.
 *
 * Body: { description, category, city? }
 */
export const enhanceTask = asyncHandler(async (req, res) => {
  const { description, category, city } = req.body;

  if (!description || !category) {
    return res.status(400).json(new ApiResponse(400, null, 'description and category are required'));
  }

  const result = await matchingService.enhanceTaskDescription(description, category, city);
  res.json(new ApiResponse(200, result, 'Task description processed'));
});

/**
 * POST /api/ai/estimate-price
 * Get an AI-powered price range estimate.
 *
 * Body: { category, description, city? }
 */
export const estimatePrice = asyncHandler(async (req, res) => {
  const { category, description, city } = req.body;

  if (!category || !description) {
    return res.status(400).json(new ApiResponse(400, null, 'category and description are required'));
  }

  const result = await matchingService.estimatePrice(category, description, city);
  res.json(new ApiResponse(200, result, 'Price estimation complete'));
});

/**
 * POST /api/ai/rank-helpers
 * Get AI-ranked helper ordering for a booking.
 *
 * Body: { bookingId, helperIds: string[] }
 */
export const rankHelpers = asyncHandler(async (req, res) => {
  const { bookingId, helperIds } = req.body;

  if (!bookingId || !Array.isArray(helperIds) || helperIds.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'bookingId and helperIds array are required'));
  }

  const result = await matchingService.rankHelpersForBooking(bookingId, helperIds);
  res.json(new ApiResponse(200, result, 'Helper ranking complete'));
});

/**
 * POST /api/ai/assess-risk
 * Assess the risk level of a new booking.
 *
 * Body: { title, description, category, price, location }
 */
export const assessRisk = asyncHandler(async (req, res) => {
  const { title, description, category, price, location } = req.body;

  if (!title || !category) {
    return res.status(400).json(new ApiResponse(400, null, 'title and category are required'));
  }

  const result = await matchingService.assessBookingRisk({
    title,
    description,
    category,
    price,
    location,
    customerId: req.user?.id,
  });

  res.json(new ApiResponse(200, result, 'Risk assessment complete'));
});

/**
 * POST /api/ai/chat-suggestion
 * Generate a reply suggestion for a helper.
 *
 * Body: { bookingTitle, customerMessage, category }
 */
export const getChatSuggestion = asyncHandler(async (req, res) => {
  const { bookingTitle, customerMessage, category } = req.body;

  if (!customerMessage) {
    return res.status(400).json(new ApiResponse(400, null, 'customerMessage is required'));
  }

  const result = await matchingService.generateChatSuggestion({
    bookingTitle: bookingTitle || 'Service request',
    customerMessage,
    category: category || 'general',
  });

  res.json(new ApiResponse(200, result, 'Chat suggestion generated'));
});
