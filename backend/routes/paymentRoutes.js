import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createOrderRules,
  verifyPaymentRules,
  paymentFailureRules,
  refundRules,
  getPaymentRules,
} from '../validations/paymentValidation.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// ── Create Razorpay Order (Customer only) ───────────────────────────────
router.post(
  '/create-order',
  authorize('customer'),
  createOrderRules,
  validate,
  paymentController.createOrder
);

// ── Verify Payment (Customer only) ──────────────────────────────────────
router.post(
  '/verify',
  authorize('customer'),
  verifyPaymentRules,
  validate,
  paymentController.verifyPayment
);

// ── Payment Failure (Customer only) ─────────────────────────────────────
router.post(
  '/failure',
  authorize('customer'),
  paymentFailureRules,
  validate,
  paymentController.paymentFailure
);

// ── Refund (Customer or Helper) ─────────────────────────────────────────
router.post(
  '/refund',
  refundRules,
  validate,
  paymentController.initiateRefund
);

// ── Transaction History (All authenticated users) ───────────────────────
router.get('/history', paymentController.getPaymentHistory);

// ── Get Payment by ID (All authenticated users) ─────────────────────────
router.get('/:id', getPaymentRules, validate, paymentController.getPaymentById);

export default router;

