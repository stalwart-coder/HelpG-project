import { Router } from 'express';
import { authenticateAdmin, authorize } from '../middleware/adminAuth.js';
import validate from '../middleware/validate.js';
import { adminLimiter } from '../middleware/rateLimiter.js';
import * as adminValidation from '../validations/adminValidation.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

// ── Public routes (with admin rate limiting) ───────────────────────────
router.post('/login', adminLimiter, adminValidation.loginRules, validate, adminController.login);

// ── All routes below require admin authentication ──────────────────────
router.use(authenticateAdmin);

// ── Admin Profile ──────────────────────────────────────────────────────
router.get('/me', adminController.getProfile);
router.patch('/me', adminController.updateProfile);

// ── Admin Management (Super Admin only) ────────────────────────────────
router.get('/admins', authorize('super_admin'), adminController.listAdmins);
router.post('/admins', authorize('super_admin'), adminValidation.createAdminRules, validate, adminController.createAdmin);
router.patch('/admins/:id/deactivate', authorize('super_admin'), adminController.deactivateAdmin);

// ── Dashboard ──────────────────────────────────────────────────────────
router.get('/dashboard', authorize('users.view'), adminController.getDashboardStats);
router.get('/dashboard/live', authorize('users.view'), adminController.getLiveStats);

// ── User Management ────────────────────────────────────────────────────
router.get('/users', authorize('users.view'), adminValidation.commonPaginationRules, validate, adminController.listUsers);
router.get('/users/:id/history', authorize('users.view'), adminController.getUserHistory);
router.patch('/users/:id/status', authorize('users.manage'), adminValidation.toggleUserStatusRules, validate, adminController.toggleUserStatus);
router.delete('/users/:id', authorize('users.manage'), adminValidation.deleteUserRules, validate, adminController.deleteUser);

// ── Helper Management ──────────────────────────────────────────────────
router.get('/helpers', authorize('helpers.view'), adminValidation.commonPaginationRules, validate, adminController.listHelpers);
router.get('/helpers/:id/earnings', authorize('helpers.view'), adminController.getHelperEarnings);
router.patch('/helpers/:id/approve', authorize('helpers.manage'), adminValidation.approveHelperRules, validate, adminController.approveHelper);
router.patch('/helpers/:id/suspend', authorize('helpers.manage'), adminValidation.suspendHelperRules, validate, adminController.suspendHelper);

// ── KYC Management ─────────────────────────────────────────────────────
router.get('/kyc', authorize('kyc.view'), adminValidation.commonPaginationRules, validate, adminController.listPendingKycs);
router.get('/kyc/audit', authorize('kyc.manage'), adminController.getKycAuditHistory);
router.patch('/kyc/:id/approve', authorize('kyc.manage'), adminValidation.approveKycRules, validate, adminController.approveKyc);
router.patch('/kyc/:id/reject', authorize('kyc.manage'), adminValidation.rejectKycRules, validate, adminController.rejectKyc);

// ── Booking Management ─────────────────────────────────────────────────
router.get('/bookings', authorize('bookings.view'), adminValidation.commonPaginationRules, validate, adminController.listAllBookings);
router.patch('/bookings/:id/cancel', authorize('bookings.manage'), adminValidation.cancelBookingRules, validate, adminController.cancelBooking);
router.patch('/bookings/:id/reassign', authorize('bookings.manage'), adminValidation.reassignBookingRules, validate, adminController.reassignHelper);

// ── Payment Management ─────────────────────────────────────────────────
router.get('/payments/transactions', authorize('payments.manage'), adminValidation.commonPaginationRules, validate, adminController.listTransactions);
router.get('/payments/earnings', authorize('payments.manage'), adminController.getPlatformEarnings);
router.post('/payments/:id/refund', authorize('payments.manage'), adminValidation.processRefundRules, validate, adminController.processRefund);

// ── Support Ticket Management ──────────────────────────────────────────
router.get('/tickets', authorize('support.manage'), adminValidation.commonPaginationRules, validate, adminController.listTickets);
router.patch('/tickets/:id/assign', authorize('support.manage'), adminValidation.assignTicketRules, validate, adminController.assignTicket);
router.patch('/tickets/:id/resolve', authorize('support.manage'), adminValidation.resolveTicketRules, validate, adminController.resolveTicket);
router.patch('/tickets/:id/close', authorize('support.manage'), adminValidation.ticketActionRules, validate, adminController.closeTicket);
router.post('/tickets/:id/notes', authorize('support.manage'), adminValidation.ticketActionRules, validate, adminController.addTicketNote);

// ── Coupon Management ──────────────────────────────────────────────────
router.get('/coupons', authorize('coupons.manage'), adminValidation.commonPaginationRules, validate, adminController.listCoupons);
router.post('/coupons', authorize('coupons.manage'), adminValidation.createCouponRules, validate, adminController.createCoupon);
router.patch('/coupons/:id', authorize('coupons.manage'), adminValidation.updateCouponRules, validate, adminController.updateCoupon);
router.patch('/coupons/:id/disable', authorize('coupons.manage'), adminController.disableCoupon);
router.delete('/coupons/:id', authorize('coupons.manage'), adminController.deleteCoupon);

// ── Reports ────────────────────────────────────────────────────────────
router.get('/reports/revenue', authorize('reports.view'), adminController.getRevenueReport);
router.get('/reports/bookings', authorize('reports.view'), adminController.getBookingReport);
router.get('/reports/helpers', authorize('reports.view'), adminController.getHelperPerformanceReport);
router.get('/reports/customers', authorize('reports.view'), adminController.getCustomerGrowthReport);
router.get('/reports/cancellations', authorize('reports.view'), adminController.getCancellationReport);

// ── Audit Logs ─────────────────────────────────────────────────────────
router.get('/audit-logs', authorize('audit.view'), adminController.getAuditLogs);

export default router;
