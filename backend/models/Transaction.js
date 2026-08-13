import mongoose from 'mongoose';

/**
 * Transaction model for payment processing with Razorpay.
 * Handles: payments, refunds, withdrawals, deposits, earnings.
 */
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'payment',
        'refund',
        'withdrawal',
        'deposit',
        'referral_bonus',
        'promo_credit',
        'adjustment',
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'razorpay', 'cash', 'upi'],
      default: 'razorpay',
    },
    // ── Razorpay fields ────────────────────────────────────────────────
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    // ── Refund tracking ────────────────────────────────────────────────
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processing', 'completed', 'failed'],
      default: 'none',
    },
    refundId: {
      type: String,
      default: '',
    },
    refundReason: {
      type: String,
      default: '',
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    // ── Commission tracking ────────────────────────────────────────────
    commissionPercent: {
      type: Number,
      default: 10,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    helperEarnings: {
      type: Number,
      default: 0,
    },
    // ── Metadata ────────────────────────────────────────────────────────
    description: {
      type: String,
      default: '',
    },
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ─────────────────────────────────────────────────────────────────
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ razorpayOrderId: 1 });
transactionSchema.index({ razorpayPaymentId: 1 });
transactionSchema.index({ type: 1, status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
