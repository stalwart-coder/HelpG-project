/**
 * AI API client.
 * Provides methods for HelpJi AI features from the frontend.
 * All methods gracefully return fallback values if AI is unavailable.
 */
import api from './apiClient.js';

/**
 * Check if AI is available on the backend.
 * @returns {Promise<{available: boolean, features: string[]}>}
 */
export async function getAiStatus() {
  try {
    const response = await api.get('/ai/status');
    return response.data;
  } catch {
    return { available: false, features: [] };
  }
}

/**
 * Enhance a task description using AI.
 * @param {string} description - Original description
 * @param {string} category - Service category
 * @param {string} [city] - City for context
 * @returns {Promise<{enhanced: string, original: string, aiUsed: boolean}>}
 */
export async function enhanceTaskDescription(description, category, city = '') {
  try {
    const response = await api.post('/ai/enhance-task', { description, category, city });
    return response.data;
  } catch {
    return { enhanced: description, original: description, aiUsed: false };
  }
}

/**
 * Get an AI-powered price estimate.
 * @param {string} category
 * @param {string} description
 * @param {string} [city]
 * @returns {Promise<{minPrice, maxPrice, suggestedPrice, priceUnit, rationale, aiUsed}>}
 */
export async function estimatePrice(category, description, city = '') {
  try {
    const response = await api.post('/ai/estimate-price', { category, description, city });
    return response.data;
  } catch {
    return { minPrice: null, maxPrice: null, suggestedPrice: null, aiUsed: false };
  }
}

/**
 * Get an AI-generated chat reply suggestion for a helper.
 * @param {string} bookingTitle
 * @param {string} customerMessage
 * @param {string} category
 * @returns {Promise<{suggestion: string|null, aiUsed: boolean}>}
 */
export async function getChatSuggestion(bookingTitle, customerMessage, category = '') {
  try {
    const response = await api.post('/ai/chat-suggestion', {
      bookingTitle,
      customerMessage,
      category,
    });
    return response.data;
  } catch {
    return { suggestion: null, aiUsed: false };
  }
}

export default {
  getAiStatus,
  enhanceTaskDescription,
  estimatePrice,
  getChatSuggestion,
};
