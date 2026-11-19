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

// ── Create Razorpay Order (Customer / Helper) ───────────────────────────
router.post(
  '/create-order',
  authorize('customer', 'helper', 'admin'),
  createOrderRules,
  validate,
  paymentController.createOrder
);

// ── Verify Payment (Customer / Helper) ──────────────────────────────────
router.post(
  '/verify',
  authorize('customer', 'helper', 'admin'),
  verifyPaymentRules,
  validate,
  paymentController.verifyPayment
);

// ── Payment Failure (Customer / Helper) ─────────────────────────────────
router.post(
  '/failure',
  authorize('customer', 'helper', 'admin'),
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

