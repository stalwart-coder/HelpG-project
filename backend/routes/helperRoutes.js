import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  updateProfileRules,
  toggleAvailabilityRules,
  updateScheduleRules,
  addServiceAreaRules,
  acceptRejectBookingRules,
  updateTaskStatusRules,
} from '../validations/helperValidation.js';
import { withdrawRules } from '../validations/withdrawValidation.js';
import * as helperController from '../controllers/helperController.js';
import * as withdrawController from '../controllers/withdrawController.js';

const router = Router();

// ── Helper Discovery (Customer and Helper Accessible) ───────────────────────
router.use(authenticate);
router.get('/nearby', helperController.getNearbyHelpers);

// All subsequent helper endpoints require helper role
router.use(authorize('helper'));

// ── Helper Profile ──────────────────────────────────────────────────────
router.get('/profile', helperController.getProfile);
router.patch('/profile', updateProfileRules, validate, helperController.updateProfile);

// ── Helper Dashboard ────────────────────────────────────────────────────
router.get('/dashboard', helperController.getDashboard);

// ── Accept / Reject Booking ─────────────────────────────────────────────
router.patch('/bookings/:id/accept', acceptRejectBookingRules, validate, helperController.acceptBooking);
router.post('/bookings/:id/accept', acceptRejectBookingRules, validate, helperController.acceptBooking);
router.patch('/bookings/:id/reject', acceptRejectBookingRules, validate, helperController.rejectBooking);
router.post('/bookings/:id/reject', acceptRejectBookingRules, validate, helperController.rejectBooking);

// ── Task Status Updates ─────────────────────────────────────────────────
router.patch('/bookings/:id/start', updateTaskStatusRules, validate, helperController.startTask);
router.post('/bookings/:id/start', updateTaskStatusRules, validate, helperController.startTask);
router.patch('/bookings/:id/arrived', updateTaskStatusRules, validate, helperController.markArrived);
router.post('/bookings/:id/arrived', updateTaskStatusRules, validate, helperController.markArrived);
router.patch('/bookings/:id/complete', updateTaskStatusRules, validate, helperController.completeTask);
router.post('/bookings/:id/complete', updateTaskStatusRules, validate, helperController.completeTask);

// ── Availability Toggle ─────────────────────────────────────────────────
router.get('/availability', helperController.getAvailability);
router.patch('/availability', toggleAvailabilityRules, validate, helperController.toggleAvailability);

// ── Working Schedule ────────────────────────────────────────────────────
router.get('/schedule', helperController.getSchedule);
router.put('/schedule', updateScheduleRules, validate, helperController.updateSchedule);

// ── Service Area ────────────────────────────────────────────────────────
router.get('/service-areas', helperController.getServiceAreas);
router.post('/service-areas', addServiceAreaRules, validate, helperController.addServiceArea);
router.patch('/service-areas/:areaId', addServiceAreaRules, validate, helperController.updateServiceArea);
router.delete('/service-areas/:areaId', helperController.removeServiceArea);

// ── Earnings Summary & History ──────────────────────────────────────────
router.get('/earnings', helperController.getEarningsSummary);
router.get('/earnings/summary', helperController.getEarningsSummary);
router.get('/earnings/history', helperController.getEarningsHistory);

// ── Booking History ─────────────────────────────────────────────────────
router.get('/booking-history', helperController.getBookingHistory);

// ── Withdrawal ──────────────────────────────────────────────────────────
router.post('/withdraw', withdrawRules, validate, withdrawController.requestWithdrawal);
router.get('/withdraw/history', withdrawController.getWithdrawalHistory);
// Alias for frontend compatibility
router.get('/withdrawals', withdrawController.getWithdrawalHistory);
router.get('/wallet', withdrawController.getWalletBalance);

export default router;
