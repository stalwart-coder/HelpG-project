/**
 * Payment API client.
 * Provides methods for Razorpay payment flows.
 */
import api from './apiClient.js';

/**
 * Create a Razorpay order for a booking.
 * @param {Object} data - { bookingId, amount }
 * @returns {Promise<{orderId, amount, currency, keyId}>}
 */
export async function createOrder(data) {
  const response = await api.post('/payments/create-order', data);
  return response.data;
}

/**
 * Verify a completed Razorpay payment.
 * @param {Object} data - { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }
 * @returns {Promise<Object>} Verified transaction
 */
export async function verifyPayment(data) {
  const response = await api.post('/payments/verify', data);
  return response.data;
}

/**
 * Report a payment failure.
 * @param {Object} data - { razorpay_order_id, razorpay_payment_id?, error_code, error_description }
 * @returns {Promise<Object>}
 */
export async function reportFailure(data) {
  const response = await api.post('/payments/failure', data);
  return response.data;
}

/**
 * Request a refund.
 * @param {Object} data - { bookingId, reason }
 * @returns {Promise<Object>}
 */
export async function requestRefund(data) {
  const response = await api.post('/payments/refund', data);
  return response.data;
}

/**
 * Get payment/transaction history.
 * @param {Object} query - { limit, skip, type }
 * @returns {Promise<{transactions, total}>}
 */
export async function getPaymentHistory(query = {}) {
  const params = new URLSearchParams(query).toString();
  const response = await api.get(`/payments/history${params ? `?${params}` : ''}`);
  return response.data;
}

/**
 * Get a single payment/transaction by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getPaymentById(id) {
  const response = await api.get(`/payments/${id}`);
  return response.data;
}

export default {
  createOrder,
  verifyPayment,
  reportFailure,
  requestRefund,
  getPaymentHistory,
  getPaymentById,
};
