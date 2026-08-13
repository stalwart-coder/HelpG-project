import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import HelperProfile from '../models/HelperProfile.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

/**
 * Razorpay client instance.
 */
const razorpay = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});

/**
 * Platform commission percentage (configurable from env).
 */
const PLATFORM_COMMISSION_PERCENT = env.payment.platformCommissionPercent;

// ── Constants ───────────────────────────────────────────────────────────────
const PAYMENT_CURRENCY = 'INR';

// ═════════════════════════════════════════════════════════════════════════════
// 1. CREATE RAZORPAY ORDER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Create a Razorpay order for a booking.
 * The booking must be in 'pending' status and not already paid.
 *
 * @param {string} userId - Customer user ID
 * @param {string} bookingId - Booking MongoDB ID
 * @returns {Promise<Object>} { order, booking }
 */
export async function createOrder(userId, bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Verify the customer owns this booking
  if (booking.customer.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to pay for this booking');
  }

  if (booking.status !== 'pending') {
    throw new ApiError(400, `Cannot process payment for booking with status '${booking.status}'`);
  }

  // Check if a transaction already exists for this booking (prevent duplicate orders)
  const existingTx = await Transaction.findOne({
    bookingId,
    type: 'payment',
    status: { $in: ['pending', 'completed'] },
  });

  if (existingTx) {
    // If there's an existing pending order, return it
    if (existingTx.status === 'pending' && existingTx.razorpayOrderId) {
      return {
        order: {
          id: existingTx.razorpayOrderId,
          amount: existingTx.amount,
          currency: PAYMENT_CURRENCY,
          receipt: existingTx._id.toString(),
        },
        booking,
        transaction: existingTx,
      };
    }
    // If already completed, don't allow re-payment
    if (existingTx.status === 'completed') {
      throw new ApiError(400, 'This booking has already been paid for');
    }
  }

  const amountInPaise = Math.round(booking.totalAmount * 100);
  const receipt = `rcpt_${bookingId}_${Date.now()}`;

  let order;
  try {
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: PAYMENT_CURRENCY,
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        customerId: userId,
      },
    });
  } catch (error) {
    logger.error('Razorpay order creation failed', {
      error: error.message,
      bookingId,
    });
    throw new ApiError(502, 'Payment gateway error. Please try again.');
  }

  // Calculate platform fee
  const platformFee = Math.round(booking.price * PLATFORM_COMMISSION_PERCENT * 100) / 100;
  const netAmount = booking.totalAmount - platformFee;

  // Create transaction record
  const transaction = await Transaction.create({
    userId,
    bookingId,
    type: 'payment',
    amount: booking.totalAmount,
    fee: platformFee,
    netAmount,
    status: 'pending',
    paymentMethod: 'razorpay',
    razorpayOrderId: order.id,
    description: `Payment for booking #${bookingId}`,
  });

  logger.info('Razorpay order created', {
    orderId: order.id,
    bookingId,
    amount: booking.totalAmount,
  });

  return {
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    },
    booking,
    transaction,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. VERIFY RAZORPAY PAYMENT SIGNATURE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Verify the Razorpay payment signature.
 * Uses HMAC SHA256 to verify the signature matches the order and payment IDs.
 *
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} razorpaySignature
 * @returns {boolean}
 */
export function verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpaySignature;
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. RAZORPAY WEBHOOK HANDLER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Verify Razorpay webhook signature.
 * @param {string} body - Raw request body
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean}
 */
export function verifyWebhookSignature(body, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Handle Razorpay webhook events.
 * @param {string} event - Webhook event name
 * @param {Object} payload - Webhook payload
 */
export async function handleWebhook(event, payload) {
  switch (event) {
    case 'payment.captured': {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      // Find transaction by razorpay order ID
      const transaction = await Transaction.findOne({
        razorpayOrderId: orderId,
        type: 'payment',
      });

      if (!transaction) {
        logger.warn('Webhook: Transaction not found for order', { orderId });
        return;
      }

      if (transaction.status === 'completed') {
        logger.info('Webhook: Payment already processed', { paymentId });
        return;
      }

      transaction.status = 'completed';
      transaction.razorpayPaymentId = paymentId;
      transaction.description = 'Payment captured via webhook';
      await transaction.save();

      // Update booking
      const booking = await Booking.findById(transaction.bookingId);
      if (booking && booking.status === 'pending') {
        booking.status = 'confirmed';
        booking.timeline.push({
          status: 'confirmed',
          timestamp: new Date(),
          note: 'Payment received — booking confirmed (webhook)',
          by: 'system',
        });
        await booking.save();
      }

      logger.info('Webhook: Payment captured successfully', {
        orderId,
        paymentId,
        bookingId: transaction.bookingId,
      });
      break;
    }

    case 'payment.failed': {
      const failedPayment = payload.payment.entity;
      const failedOrderId = failedPayment.order_id;

      const transaction = await Transaction.findOne({
        razorpayOrderId: failedOrderId,
        type: 'payment',
      });

      if (transaction) {
        transaction.status = 'failed';
        transaction.description = `Payment failed: ${failedPayment.error_description || 'Unknown error'}`;
        await transaction.save();
        logger.info('Webhook: Payment failed recorded', { orderId: failedOrderId });
      }
      break;
    }

    default:
      logger.debug('Webhook: Unhandled event', { event });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. PAYMENT SUCCESS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Handle successful payment verification.
 * Never trust the frontend — always verify server-side.
 *
 * @param {Object} data - { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @returns {Promise<Object>} { booking, transaction }
 */
export async function handlePaymentSuccess(data) {
  const { bookingId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = data;

  // Find the transaction
  const transaction = await Transaction.findOne({
    bookingId,
    razorpayOrderId,
    type: 'payment',
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found for this order');
  }

  // Prevent duplicate verification
  if (transaction.status === 'completed') {
    // Return success silently — idempotent
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'name email phone avatar');
    return { booking, transaction };
  }

  // Verify the signature server-side
  const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    transaction.status = 'failed';
    transaction.description = 'Payment signature verification failed';
    await transaction.save();

    logger.error('Payment signature verification failed', {
      razorpayOrderId,
      razorpayPaymentId,
      bookingId,
    });

    throw new ApiError(400, 'Payment verification failed. Invalid signature.');
  }

  // Verify with Razorpay API (double-check)
  let razorpayPayment;
  try {
    razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
  } catch (error) {
    logger.error('Failed to fetch payment from Razorpay', {
      error: error.message,
      razorpayPaymentId,
    });
    throw new ApiError(502, 'Failed to verify payment with gateway');
  }

  if (razorpayPayment.status !== 'captured') {
    transaction.status = 'failed';
    transaction.description = `Payment status is '${razorpayPayment.status}', not 'captured'`;
    await transaction.save();

    throw new ApiError(400, `Payment was not captured. Status: ${razorpayPayment.status}`);
  }

  // ── All checks passed — confirm the payment ──────────────────────────

  transaction.status = 'completed';
  transaction.razorpayPaymentId = razorpayPaymentId;
  transaction.razorpaySignature = razorpaySignature;
  await transaction.save();

  // Update the booking — mark as confirmed (paid)
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  booking.status = 'confirmed';
  booking.timeline.push({
    status: 'confirmed',
    timestamp: new Date(),
    note: 'Payment received — booking confirmed',
    by: 'system',
  });
  await booking.save();

  // Update customer's wallet balance (use transaction.userId which is the customer ID)
  const customerId = transaction.userId;
  const wallet = await getOrCreateWallet(customerId);
  wallet.balance -= booking.totalAmount;
  wallet.totalEarned += booking.totalAmount;
  await wallet.save();

  logger.info('Payment successful', {
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    amount: transaction.amount,
    netAmount: transaction.netAmount,
  });

  return {
    booking: await Booking.findById(bookingId)
      .populate('customer', 'name email phone avatar')
      .populate('helper', 'name email phone avatar'),
    transaction,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. PAYMENT FAILURE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Handle payment failure.
 *
 * @param {Object} data - { bookingId, razorpay_order_id, error }
 * @returns {Promise<Object>} { booking, transaction }
 */
export async function handlePaymentFailure(data) {
  const { bookingId, razorpay_order_id: razorpayOrderId, error } = data;

  let transaction = await Transaction.findOne({
    bookingId,
    razorpayOrderId,
    type: 'payment',
  });

  // If no transaction exists, create a failed one for record
  if (!transaction) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    const platformFee = Math.round(booking.price * PLATFORM_COMMISSION_PERCENT * 100) / 100;
    const netAmount = booking.totalAmount - platformFee;

    transaction = await Transaction.create({
      userId: booking.customer,
      bookingId,
      type: 'payment',
      amount: booking.totalAmount,
      fee: platformFee,
      netAmount,
      status: 'failed',
      paymentMethod: 'razorpay',
      razorpayOrderId,
      description: `Failed payment for booking #${bookingId}`,
    });
  }

  transaction.status = 'failed';
  transaction.description = error?.description
    ? `Payment failed: ${error.description}`
    : 'Payment failed';
  if (error?.code) transaction.razorpayPaymentId = `error_${error.code}`;
  await transaction.save();

  // Booking stays in 'pending' — no status change

  logger.info('Payment failed', {
    bookingId,
    razorpayOrderId,
    error: error?.description || 'Unknown error',
  });

  const booking = await Booking.findById(bookingId)
    .populate('customer', 'name email phone avatar');

  return { booking, transaction };
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. REFUND (SERVICE LAYER ONLY)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Initiate a refund for a booking via Razorpay.
 * Called when a booking is cancelled after payment.
 *
 * @param {string} bookingId
 * @param {string} reason
 * @returns {Promise<Object>} Updated transaction
 */
export async function initiateRefund(bookingId, reason) {
  const transaction = await Transaction.findOne({
    bookingId,
    type: 'payment',
    status: 'completed',
  });

  if (!transaction) {
    throw new ApiError(404, 'No completed payment found for this booking');
  }

  if (!transaction.razorpayPaymentId) {
    throw new ApiError(400, 'No Razorpay payment ID found for this transaction');
  }

  // Check if refund already exists
  const existingRefund = await Transaction.findOne({
    bookingId,
    type: 'refund',
    status: { $in: ['pending', 'completed'] },
  });

  if (existingRefund) {
    if (existingRefund.status === 'completed') {
      throw new ApiError(400, 'A refund has already been processed for this booking');
    }
    // Return existing pending refund
    return existingRefund;
  }

  // Process refund via Razorpay
  let razorpayRefund;
  try {
    razorpayRefund = await razorpay.payments.refund(transaction.razorpayPaymentId, {
      amount: Math.round(transaction.netAmount * 100), // Refund net amount (excl platform fee)
      notes: {
        bookingId,
        reason,
        originalTransactionId: transaction._id.toString(),
      },
    });
  } catch (error) {
    logger.error('Razorpay refund failed', {
      error: error.message,
      bookingId,
      razorpayPaymentId: transaction.razorpayPaymentId,
    });
    throw new ApiError(502, 'Refund failed at payment gateway. Please try again or contact support.');
  }

  // Create refund transaction record
  const refundTransaction = await Transaction.create({
    userId: transaction.userId,
    bookingId,
    type: 'refund',
    amount: -(transaction.netAmount), // negative amount for refunds
    fee: 0,
    netAmount: -(transaction.netAmount),
    status: razorpayRefund.status === 'processed' ? 'completed' : 'pending',
    paymentMethod: 'razorpay',
    razorpayOrderId: transaction.razorpayOrderId,
    razorpayPaymentId: transaction.razorpayPaymentId,
    description: `Refund for booking #${bookingId}: ${reason}`,
  });

  // Mark original transaction as refunded
  transaction.status = 'refunded';
  await transaction.save();

  logger.info('Refund initiated', {
    bookingId,
    refundId: refundTransaction._id,
    amount: transaction.netAmount,
    razorpayRefundId: razorpayRefund.id,
  });

  return refundTransaction;
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. WALLET TRANSACTION RECORDING
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Get or create a wallet for a user.
 */
async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }
  return wallet;
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. TRANSACTION HISTORY
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Get transaction history for the current user.
 *
 * @param {string} userId
 * @param {Object} query - { type, status, limit, skip }
 * @returns {Promise<Object>} { transactions, total }
 */
export async function getTransactionHistory(userId, query = {}) {
  const filter = { userId };

  if (query.type) {
    filter.type = query.type;
  }
  if (query.status) {
    filter.status = query.status;
  }

  const transactions = await Transaction.find(filter)
    .populate('bookingId', 'title category status')
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(query.limit, 10) || 50, 100))
    .skip(parseInt(query.skip, 10) || 0);

  const total = await Transaction.countDocuments(filter);

  // Get wallet balance
  const wallet = await getOrCreateWallet(userId);

  return {
    transactions,
    total,
    walletBalance: wallet.balance,
    totalEarned: wallet.totalEarned,
    totalWithdrawn: wallet.totalWithdrawn,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 9. GET PAYMENT BY ID
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Get a single transaction/payment by ID.
 *
 * @param {string} transactionId
 * @param {string} userId
 * @returns {Promise<Object>} Transaction
 */
export async function getPaymentById(transactionId, userId) {
  const transaction = await Transaction.findById(transactionId)
    .populate('bookingId', 'title category status price totalAmount')
    .populate('userId', 'name email phone avatar');

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  // Must be the owner or an admin
  if (transaction.userId._id.toString() !== userId) {
    throw new ApiError(403, 'You do not have access to this transaction');
  }

  return transaction;
}

// ═════════════════════════════════════════════════════════════════════════════
// 10. HELPER EARNINGS CALCULATION
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Calculate and credit helper earnings for a completed booking.
 * Called when a task is marked as completed.
 *
 * @param {string} helperId
 * @param {string} bookingId
 * @returns {Promise<Object>} Updated helper profile
 */
export async function creditHelperEarnings(helperId, bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status !== 'completed') {
    throw new ApiError(400, 'Cannot credit earnings for incomplete booking');
  }

  // Calculate earnings after platform commission
  const helperEarnings = Math.round(
    booking.price * (1 - PLATFORM_COMMISSION_PERCENT) * 100
  ) / 100;

  // Update helper profile
  const profile = await HelperProfile.findOne({ userId: helperId });
  if (profile) {
    profile.totalEarnings += helperEarnings;
    profile.totalCompletedJobs += 1;
    await profile.save();
  }

  // Create a helper earning transaction
  await Transaction.create({
    userId: helperId,
    bookingId,
    type: 'deposit',
    amount: helperEarnings,
    fee: 0,
    netAmount: helperEarnings,
    status: 'completed',
    paymentMethod: 'wallet',
    description: `Earnings for completed booking #${bookingId}`,
  });

  // Update helper's wallet
  const wallet = await getOrCreateWallet(helperId);
  wallet.balance += helperEarnings;
  wallet.totalEarned += helperEarnings;
  await wallet.save();

  logger.info('Helper earnings credited', {
    helperId,
    bookingId,
    amount: helperEarnings,
  });

  return { earnings: helperEarnings, profile };
}

// ═════════════════════════════════════════════════════════════════════════════
// 11. PLATFORM COMMISSION CALCULATION
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Calculate platform commission for a given booking price.
 *
 * @param {number} price - Booking service price
 * @returns {Object} { commission, helperEarnings, platformFee }
 */
export function calculatePlatformCommission(price) {
  const commission = Math.round(price * PLATFORM_COMMISSION_PERCENT * 100) / 100;
  const helperEarnings = price - commission;

  return {
    commission,
    helperEarnings: Math.round(helperEarnings * 100) / 100,
    platformFee: commission,
    commissionPercent: PLATFORM_COMMISSION_PERCENT * 100,
  };
}

export default {
  createOrder,
  verifySignature,
  verifyWebhookSignature,
  handleWebhook,
  handlePaymentSuccess,
  handlePaymentFailure,
  initiateRefund,
  getTransactionHistory,
  getPaymentById,
  creditHelperEarnings,
  calculatePlatformCommission,
};
