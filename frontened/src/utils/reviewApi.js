/**
 * Review API client.
 */
import api from './apiClient.js';

/**
 * Submit a review for a completed booking.
 * @param {Object} data - { bookingId, rating, comment, tags?, photos? }
 * @returns {Promise<Object>} Created review
 */
export async function createReview(data) {
  const response = await api.post('/reviews', data);
  return response.data;
}

/**
 * Get my submitted reviews (as a customer).
 * @param {Object} query - { limit, skip }
 * @returns {Promise<{reviews, total}>}
 */
export async function getMyReviews(query = {}) {
  const params = new URLSearchParams(query).toString();
  const response = await api.get(`/reviews/my${params ? `?${params}` : ''}`);
  return response.data;
}

/**
 * Get the review for a specific booking.
 * @param {string} bookingId
 * @returns {Promise<Object|null>}
 */
export async function getBookingReview(bookingId) {
  const response = await api.get(`/reviews/booking/${bookingId}`);
  return response.data;
}

/**
 * Get all public reviews for a helper.
 * @param {string} helperId
 * @param {Object} query - { limit, skip }
 * @returns {Promise<{reviews, total, ratingDistribution}>}
 */
export async function getHelperReviews(helperId, query = {}) {
  const params = new URLSearchParams(query).toString();
  const response = await api.get(`/reviews/helper/${helperId}${params ? `?${params}` : ''}`);
  return response.data;
}

/**
 * Helper responds to a review.
 * @param {string} reviewId
 * @param {string} response - The reply text
 * @returns {Promise<Object>}
 */
export async function respondToReview(reviewId, responseText) {
  const response = await api.patch(`/reviews/${reviewId}/respond`, { response: responseText });
  return response.data;
}

export default {
  createReview,
  getMyReviews,
  getBookingReview,
  getHelperReviews,
  respondToReview,
};
