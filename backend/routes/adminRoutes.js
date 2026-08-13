import { Router } from 'express';
import { authenticateAdmin, authorizeAdmin, authorizePermission } from '../middleware/adminAuth.js';
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
router.get('/admins', authorizeAdmin(['super_admin']), adminController.listAdmins);
router.post('/admins', authorizeAdmin(['super_admin']), adminValidation.createAdminRules, validate, adminController.createAdmin);
router.patch('/admins/:id/deactivate', authorizeAdmin(['super_admin']), adminController.deactivateAdmin);

// ── Dashboard ──────────────────────────────────────────────────────────
router.get('/dashboard', authorizePermission('users.view'), adminController.getDashboardStats);
router.get('/dashboard/live', authorizePermission('users.view'), adminController.getLiveStats);

// ── User Management ────────────────────────────────────────────────────
router.get('/users', authorizePermission('users.view'), adminValidation.commonPaginationRules, validate, adminController.listUsers);
router.get('/users/:id/history', authorizePermission('users.view'), adminController.getUserHistory);
router.patch('/users/:id/status', authorizePermission('users.manage'), adminValidation.toggleUserStatusRules, validate, adminController.toggleUserStatus);
router.delete('/users/:id', authorizePermission('users.manage'), adminValidation.deleteUserRules, validate, adminController.deleteUser);

// ── Helper Management ──────────────────────────────────────────────────
router.get('/helpers', authorizePermission('helpers.view'), adminValidation.commonPaginationRules, validate, adminController.listHelpers);
router.get('/helpers/:id/earnings', authorizePermission('helpers.view'), adminController.getHelperEarnings);
router.patch('/helpers/:id/approve', authorizePermission('helpers.manage'), adminValidation.approveHelperRules, validate, adminController.approveHelper);
router.patch('/helpers/:id/suspend', authorizePermission('helpers.manage'), adminValidation.suspendHelperRules, validate, adminController.suspendHelper);

// ── KYC Management ─────────────────────────────────────────────────────
router.get('/kyc', authorizePermission('kyc.view'), adminValidation.commonPaginationRules, validate, adminController.listPendingKycs);
router.get('/kyc/audit', authorizePermission('kyc.manage'), adminController.getKycAuditHistory);
router.patch('/kyc/:id/approve', authorizePermission('kyc.manage'), adminValidation.approveKycRules, validate, adminController.approveKyc);
router.patch('/kyc/:id/reject', authorizePermission('kyc.manage'), adminValidation.rejectKycRules, validate, adminController.rejectKyc);

// ── Booking Management ─────────────────────────────────────────────────
router.get('/bookings', authorizePermission('bookings.view'), adminValidation.commonPaginationRules, validate, adminController.listAllBookings);
router.patch('/bookings/:id/cancel', authorizePermission('bookings.manage'), adminValidation.cancelBookingRules, validate, adminController.cancelBooking);
router.patch('/bookings/:id/reassign', authorizePermission('bookings.manage'), adminValidation.reassignBookingRules, validate, adminController.reassignHelper);

// ── Payment Management ─────────────────────────────────────────────────
router.get('/payments/transactions', authorizePermission('payments.manage'), adminValidation.commonPaginationRules, validate, adminController.listTransactions);
router.get('/payments/earnings', authorizePermission('payments.manage'), adminController.getPlatformEarnings);
router.post('/payments/:id/refund', authorizePermission('payments.manage'), adminValidation.processRefundRules, validate, adminController.processRefund);

// ── Support Ticket Management ──────────────────────────────────────────
router.get('/tickets', authorizePermission('support.manage'), adminValidation.commonPaginationRules, validate, adminController.listTickets);
router.patch('/tickets/:id/assign', authorizePermission('support.manage'), adminValidation.assignTicketRules, validate, adminController.assignTicket);
router.patch('/tickets/:id/resolve', authorizePermission('support.manage'), adminValidation.resolveTicketRules, validate, adminController.resolveTicket);
router.patch('/tickets/:id/close', authorizePermission('support.manage'), adminValidation.ticketActionRules, validate, adminController.closeTicket);
router.post('/tickets/:id/notes', authorizePermission('support.manage'), adminValidation.ticketActionRules, validate, adminController.addTicketNote);

// ── Coupon Management ──────────────────────────────────────────────────
router.get('/coupons', authorizePermission('coupons.manage'), adminValidation.commonPaginationRules, validate, adminController.listCoupons);
router.post('/coupons', authorizePermission('coupons.manage'), adminValidation.createCouponRules, validate, adminController.createCoupon);
router.patch('/coupons/:id', authorizePermission('coupons.manage'), adminValidation.updateCouponRules, validate, adminController.updateCoupon);
router.patch('/coupons/:id/disable', authorizePermission('coupons.manage'), adminController.disableCoupon);
router.delete('/coupons/:id', authorizePermission('coupons.manage'), adminController.deleteCoupon);

// ── Reports ────────────────────────────────────────────────────────────
router.get('/reports/revenue', authorizePermission('reports.view'), adminController.getRevenueReport);
router.get('/reports/bookings', authorizePermission('reports.view'), adminController.getBookingReport);
router.get('/reports/helpers', authorizePermission('reports.view'), adminController.getHelperPerformanceReport);
router.get('/reports/customers', authorizePermission('reports.view'), adminController.getCustomerGrowthReport);
router.get('/reports/cancellations', authorizePermission('reports.view'), adminController.getCancellationReport);

// ── Audit Logs ─────────────────────────────────────────────────────────
router.get('/audit-logs', authorizePermission('audit.view'), adminController.getAuditLogs);

export default router;
