import * as paymentService from '../services/paymentService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

// ═════════════════════════════════════════════════════════════════════════════
// 1. CREATE RAZORPAY ORDER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for a booking.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const data = await paymentService.createOrder(req.user._id, bookingId);
  return new ApiResponse(201, data, 'Order created successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. VERIFY PAYMENT
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature and confirm booking.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.handlePaymentSuccess(req.body);
  return new ApiResponse(200, data, 'Payment verified successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. PAYMENT FAILURE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/failure
 * Handle payment failure.
 */
export const paymentFailure = asyncHandler(async (req, res) => {
  const data = await paymentService.handlePaymentFailure(req.body);
  return new ApiResponse(200, data, 'Payment failure recorded').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. TRANSACTION HISTORY
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/payments/history
 * Get transaction history for the current user.
 */
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const data = await paymentService.getTransactionHistory(req.user._id, req.query);
  return new ApiResponse(200, data, 'Transaction history retrieved successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. GET PAYMENT BY ID
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/payments/:id
 * Get a specific payment/transaction by ID.
 */
export const getPaymentById = asyncHandler(async (req, res) => {
  const transaction = await paymentService.getPaymentById(req.params.id, req.user._id);
  return new ApiResponse(200, transaction, 'Transaction retrieved successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. REFUND
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/refund
 * Initiate a refund for a booking.
 */
export const initiateRefund = asyncHandler(async (req, res) => {
  const { bookingId, reason } = req.body;
  const refund = await paymentService.initiateRefund(bookingId, reason);
  return new ApiResponse(200, refund, 'Refund initiated successfully').send(res);
});

