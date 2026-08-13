import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createBookingRules,
  getBookingRules,
  updateStatusRules,
  cancelBookingRules,
  rescheduleBookingRules,
} from '../validations/bookingValidation.js';
import {
  createBooking,
  getMyBookings,
  getAvailableBookings,
  getHelperBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
} from '../controllers/bookingController.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// ── Customer routes ──────────────────────────────────────────────────────
router.post('/', authorize('customer'), createBookingRules, validate, createBooking);
router.get('/mine', authorize('customer'), getMyBookings);

// ── Helper routes ────────────────────────────────────────────────────────
router.get('/available', authorize('helper'), getAvailableBookings);
router.get('/helper', authorize('helper'), getHelperBookings);
router.patch(
  '/:id/status',
  authorize('helper'),
  updateStatusRules,
  validate,
  updateBookingStatus
);

// ── Shared routes (customer or helper) ───────────────────────────────────
router.get('/:id', getBookingRules, validate, getBookingById);
router.post('/:id/cancel', cancelBookingRules, validate, cancelBooking);
router.post('/:id/reschedule', authorize('customer'), rescheduleBookingRules, validate, rescheduleBooking);

export default router;

