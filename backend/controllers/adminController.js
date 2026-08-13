import * as adminService from '../services/adminService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

// ── Auth ────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await adminService.adminLogin(email, password);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return new ApiResponse(200, {
    admin: result.admin,
    accessToken: result.accessToken,
  }, 'Admin login successful').send(res);
});

export const getProfile = asyncHandler(async (req, res) => {
  const admin = await adminService.getAdminProfile(req.admin._id);
  return new ApiResponse(200, admin, 'Profile retrieved').send(res);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const admin = await adminService.updateAdminProfile(req.admin._id, req.body);
  return new ApiResponse(200, admin, 'Profile updated').send(res);
});

// ── Admin Management ────────────────────────────────────────────────────────
export const createAdmin = asyncHandler(async (req, res) => {
  const admin = await adminService.createAdmin(req.body, req.admin._id);
  return new ApiResponse(201, admin, 'Admin created successfully').send(res);
});

export const listAdmins = asyncHandler(async (req, res) => {
  const result = await adminService.listAdmins(req.query);
  return new ApiResponse(200, result, 'Admins retrieved').send(res);
});

export const deactivateAdmin = asyncHandler(async (req, res) => {
  const admin = await adminService.deactivateAdmin(req.params.id);
  return new ApiResponse(200, admin, 'Admin deactivated').send(res);
});

// ── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const stats = await adminService.getDashboardStats();
  return new ApiResponse(200, stats, 'Dashboard stats retrieved').send(res);
});

export const getLiveStats = asyncHandler(async (_req, res) => {
  const stats = await adminService.getLiveStats();
  return new ApiResponse(200, stats, 'Live stats retrieved').send(res);
});

// ── User Management ─────────────────────────────────────────────────────────
export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  return new ApiResponse(200, result, 'Users retrieved').send(res);
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive, reason } = req.body;
  const user = await adminService.toggleUserStatus(req.params.id, isActive, reason, req.admin._id);
  return new ApiResponse(200, user, `User ${isActive ? 'unblocked' : 'blocked'} successfully`).send(res);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await adminService.deleteUser(req.params.id, reason, req.admin._id);
  return new ApiResponse(200, user, 'User deleted successfully').send(res);
});

export const getUserHistory = asyncHandler(async (req, res) => {
  const result = await adminService.getUserHistory(req.params.id);
  return new ApiResponse(200, result, 'User history retrieved').send(res);
});

// ── Helper Management ───────────────────────────────────────────────────────
export const listHelpers = asyncHandler(async (req, res) => {
  const result = await adminService.listHelpers(req.query);
  return new ApiResponse(200, result, 'Helpers retrieved').send(res);
});

export const approveHelper = asyncHandler(async (req, res) => {
  const result = await adminService.approveHelper(req.params.id, req.admin._id);
  return new ApiResponse(200, result, 'Helper approved successfully').send(res);
});

export const suspendHelper = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await adminService.suspendHelper(req.params.id, reason, req.admin._id);
  return new ApiResponse(200, user, 'Helper suspended').send(res);
});

export const getHelperEarnings = asyncHandler(async (req, res) => {
  const result = await adminService.getHelperEarnings(req.params.id);
  return new ApiResponse(200, result, 'Helper earnings retrieved').send(res);
});

// ── KYC Management ──────────────────────────────────────────────────────────
export const listPendingKycs = asyncHandler(async (req, res) => {
  const result = await adminService.listPendingKycs(req.query);
  return new ApiResponse(200, result, 'KYC list retrieved').send(res);
});

export const approveKyc = asyncHandler(async (req, res) => {
  const result = await adminService.approveKyc(req.params.id, req.admin._id);
  return new ApiResponse(200, result, 'KYC approved').send(res);
});

export const rejectKyc = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const result = await adminService.rejectKyc(req.params.id, reason, req.admin._id);
  return new ApiResponse(200, result, 'KYC rejected').send(res);
});

export const getKycAuditHistory = asyncHandler(async (_req, res) => {
  const logs = await adminService.getKycAuditHistory();
  return new ApiResponse(200, logs, 'KYC audit history retrieved').send(res);
});

// ── Booking Management ──────────────────────────────────────────────────────
export const listAllBookings = asyncHandler(async (req, res) => {
  const result = await adminService.listAllBookings(req.query);
  return new ApiResponse(200, result, 'Bookings retrieved').send(res);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await adminService.adminCancelBooking(req.params.id, reason, req.admin._id);
  return new ApiResponse(200, booking, 'Booking cancelled').send(res);
});

export const reassignHelper = asyncHandler(async (req, res) => {
  const { helperId } = req.body;
  const booking = await adminService.reassignHelper(req.params.id, helperId, req.admin._id);
  return new ApiResponse(200, booking, 'Helper reassigned').send(res);
});

// ── Payment Management ──────────────────────────────────────────────────────
export const listTransactions = asyncHandler(async (req, res) => {
  const result = await adminService.listTransactions(req.query);
  return new ApiResponse(200, result, 'Transactions retrieved').send(res);
});

export const processRefund = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const result = await adminService.processRefund(req.params.id, reason, req.admin._id);
  return new ApiResponse(200, result, 'Refund processed').send(res);
});

export const getPlatformEarnings = asyncHandler(async (req, res) => {
  const result = await adminService.getPlatformEarnings(req.query);
  return new ApiResponse(200, result, 'Platform earnings retrieved').send(res);
});

// ── Support Ticket Management ───────────────────────────────────────────────
export const listTickets = asyncHandler(async (req, res) => {
  const result = await adminService.listTickets(req.query);
  return new ApiResponse(200, result, 'Tickets retrieved').send(res);
});

export const assignTicket = asyncHandler(async (req, res) => {
  const { adminId } = req.body;
  const ticket = await adminService.assignTicket(req.params.id, adminId, req.admin._id);
  return new ApiResponse(200, ticket, 'Ticket assigned').send(res);
});

export const resolveTicket = asyncHandler(async (req, res) => {
  const { resolution } = req.body;
  const ticket = await adminService.resolveTicket(req.params.id, resolution, req.admin._id);
  return new ApiResponse(200, ticket, 'Ticket resolved').send(res);
});

export const closeTicket = asyncHandler(async (req, res) => {
  const ticket = await adminService.closeTicket(req.params.id, req.admin._id);
  return new ApiResponse(200, ticket, 'Ticket closed').send(res);
});

export const addTicketNote = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const ticket = await adminService.addTicketNote(req.params.id, note, req.admin._id);
  return new ApiResponse(200, ticket, 'Note added').send(res);
});

// ── Coupon Management ───────────────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await adminService.createCoupon(req.body, req.admin._id);
  return new ApiResponse(201, coupon, 'Coupon created').send(res);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await adminService.updateCoupon(req.params.id, req.body, req.admin._id);
  return new ApiResponse(200, coupon, 'Coupon updated').send(res);
});

export const disableCoupon = asyncHandler(async (req, res) => {
  const coupon = await adminService.disableCoupon(req.params.id, req.admin._id);
  return new ApiResponse(200, coupon, 'Coupon disabled').send(res);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const result = await adminService.deleteCoupon(req.params.id, req.admin._id);
  return new ApiResponse(200, result, 'Coupon deleted').send(res);
});

export const listCoupons = asyncHandler(async (req, res) => {
  const result = await adminService.listCoupons(req.query);
  return new ApiResponse(200, result, 'Coupons retrieved').send(res);
});

// ── Reports ─────────────────────────────────────────────────────────────────
export const getRevenueReport = asyncHandler(async (req, res) => {
  const report = await adminService.getRevenueReport(req.query);
  return new ApiResponse(200, report, 'Revenue report generated').send(res);
});

export const getBookingReport = asyncHandler(async (req, res) => {
  const report = await adminService.getBookingReport(req.query);
  return new ApiResponse(200, report, 'Booking report generated').send(res);
});

export const getHelperPerformanceReport = asyncHandler(async (req, res) => {
  const report = await adminService.getHelperPerformanceReport(req.query);
  return new ApiResponse(200, report, 'Helper performance report generated').send(res);
});

export const getCustomerGrowthReport = asyncHandler(async (req, res) => {
  const report = await adminService.getCustomerGrowthReport(req.query);
  return new ApiResponse(200, report, 'Customer growth report generated').send(res);
});

export const getCancellationReport = asyncHandler(async (req, res) => {
  const report = await adminService.getCancellationReport(req.query);
  return new ApiResponse(200, report, 'Cancellation report generated').send(res);
});

// ── Audit Logs ──────────────────────────────────────────────────────────────
export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);
  return new ApiResponse(200, result, 'Audit logs retrieved').send(res);
});
