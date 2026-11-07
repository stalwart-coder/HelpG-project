import api from './apiClient.js';

// ── Auth ────────────────────────────────────────────────────────────────────
export async function adminLogin(email, password) {
  const response = await api.post('/admin/login', { email, password });
  return response.data;
}

export async function getAdminProfile() {
  const response = await api.get('/admin/me');
  return response.data;
}

export async function updateAdminProfile(data) {
  const response = await api.patch('/admin/me', data);
  return response.data;
}

// ── Admin Management ────────────────────────────────────────────────────────
export async function listAdmins(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/admin/admins?${params}` : '/admin/admins';
  const response = await api.get(endpoint);
  return response.data;
}

export async function createAdmin(data) {
  const response = await api.post('/admin/admins', data);
  return response.data;
}

export async function deactivateAdmin(id) {
  const response = await api.patch(`/admin/admins/${id}/deactivate`);
  return response.data;
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const response = await api.get('/admin/dashboard');
  return response.data;
}

export async function getLiveStats() {
  const response = await api.get('/admin/dashboard/live');
  return response.data;
}

// ── User Management ─────────────────────────────────────────────────────────
export async function listUsers(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', query.page);
  if (query.limit) params.set('limit', query.limit);
  if (query.search) params.set('search', query.search);
  if (query.role) params.set('role', query.role);
  if (query.isActive !== undefined) params.set('isActive', query.isActive);
  const qs = params.toString();
  const endpoint = qs ? `/admin/users?${qs}` : '/admin/users';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getUserHistory(userId) {
  const response = await api.get(`/admin/users/${userId}/history`);
  return response.data;
}

export async function toggleUserStatus(userId, isActive, reason = '') {
  const response = await api.patch(`/admin/users/${userId}/status`, { isActive, reason });
  return response.data;
}

export async function deleteUser(userId, reason = '') {
  const response = await api.delete(`/admin/users/${userId}`, { data: { reason } });
  return response.data;
}

// ── Helper Management ───────────────────────────────────────────────────────
export async function listHelpers(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', query.page);
  if (query.limit) params.set('limit', query.limit);
  if (query.search) params.set('search', query.search);
  if (query.isActive !== undefined) params.set('isActive', query.isActive);
  if (query.isKycVerified !== undefined) params.set('isKycVerified', query.isKycVerified);
  const qs = params.toString();
  const endpoint = qs ? `/admin/helpers?${qs}` : '/admin/helpers';
  const response = await api.get(endpoint);
  return response.data;
}

export async function approveHelper(helperId) {
  const response = await api.patch(`/admin/helpers/${helperId}/approve`);
  return response.data;
}

export async function suspendHelper(helperId, reason) {
  const response = await api.patch(`/admin/helpers/${helperId}/suspend`, { reason });
  return response.data;
}

export async function getHelperEarnings(helperId) {
  const response = await api.get(`/admin/helpers/${helperId}/earnings`);
  return response.data;
}

// ── KYC Management ──────────────────────────────────────────────────────────
export async function listPendingKycs(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', query.page);
  if (query.limit) params.set('limit', query.limit);
  if (query.status) params.set('status', query.status);
  const qs = params.toString();
  const endpoint = qs ? `/admin/kyc?${qs}` : '/admin/kyc';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getKycAuditHistory() {
  const response = await api.get('/admin/kyc/audit');
  return response.data;
}

export async function approveKyc(userId) {
  const response = await api.patch(`/admin/kyc/${userId}/approve`);
  return response.data;
}

export async function rejectKyc(userId, reason) {
  const response = await api.patch(`/admin/kyc/${userId}/reject`, { reason });
  return response.data;
}

// ── Booking Management ──────────────────────────────────────────────────────
export async function listAllBookings(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', query.page);
  if (query.limit) params.set('limit', query.limit);
  if (query.status) params.set('status', query.status);
  if (query.category) params.set('category', query.category);
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  const endpoint = qs ? `/admin/bookings?${qs}` : '/admin/bookings';
  const response = await api.get(endpoint);
  return response.data;
}

export async function adminCancelBooking(bookingId, reason) {
  const response = await api.patch(`/admin/bookings/${bookingId}/cancel`, { reason });
  return response.data;
}

export async function reassignHelper(bookingId, helperId) {
  const response = await api.patch(`/admin/bookings/${bookingId}/reassign`, { helperId });
  return response.data;
}

// ── Payment Management ──────────────────────────────────────────────────────
export async function listTransactions(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', query.page);
  if (query.limit) params.set('limit', query.limit);
  if (query.status) params.set('status', query.status);
  if (query.type) params.set('type', query.type);
  const qs = params.toString();
  const endpoint = qs ? `/admin/payments/transactions?${qs}` : '/admin/payments/transactions';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getPlatformEarnings(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/admin/payments/earnings?${params}` : '/admin/payments/earnings';
  const response = await api.get(endpoint);
  return response.data;
}

export async function processRefund(transactionId, reason) {
  const response = await api.post(`/admin/payments/${transactionId}/refund`, { reason });
  return response.data;
}

// ── Support Ticket Management ───────────────────────────────────────────────
export async function listTickets(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', query.page);
  if (query.limit) params.set('limit', query.limit);
  if (query.status) params.set('status', query.status);
  if (query.priority) params.set('priority', query.priority);
  if (query.category) params.set('category', query.category);
  const qs = params.toString();
  const endpoint = qs ? `/admin/tickets?${qs}` : '/admin/tickets';
  const response = await api.get(endpoint);
  return response.data;
}

export async function assignTicket(ticketId, adminId) {
  const response = await api.patch(`/admin/tickets/${ticketId}/assign`, { adminId });
  return response.data;
}

export async function resolveTicket(ticketId, resolution) {
  const response = await api.patch(`/admin/tickets/${ticketId}/resolve`, { resolution });
  return response.data;
}

export async function closeTicket(ticketId) {
  const response = await api.patch(`/admin/tickets/${ticketId}/close`);
  return response.data;
}

export async function addTicketNote(ticketId, note) {
  const response = await api.post(`/admin/tickets/${ticketId}/notes`, { note });
  return response.data;
}

// ── Coupon Management ───────────────────────────────────────────────────────
export async function listCoupons(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', query.page);
  if (query.limit) params.set('limit', query.limit);
  if (query.status) params.set('status', query.status);
  const qs = params.toString();
  const endpoint = qs ? `/admin/coupons?${qs}` : '/admin/coupons';
  const response = await api.get(endpoint);
  return response.data;
}

export async function createCoupon(data) {
  const response = await api.post('/admin/coupons', data);
  return response.data;
}

export async function updateCoupon(id, data) {
  const response = await api.patch(`/admin/coupons/${id}`, data);
  return response.data;
}

export async function disableCoupon(id) {
  const response = await api.patch(`/admin/coupons/${id}/disable`);
  return response.data;
}

export async function deleteCoupon(id) {
  const response = await api.delete(`/admin/coupons/${id}`);
  return response.data;
}

// ── Reports ─────────────────────────────────────────────────────────────────
export async function getRevenueReport(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/admin/reports/revenue?${params}` : '/admin/reports/revenue';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getBookingReport(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/admin/reports/bookings?${params}` : '/admin/reports/bookings';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getHelperPerformanceReport(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/admin/reports/helpers?${params}` : '/admin/reports/helpers';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getCustomerGrowthReport(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/admin/reports/customers?${params}` : '/admin/reports/customers';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getCancellationReport(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/admin/reports/cancellations?${params}` : '/admin/reports/cancellations';
  const response = await api.get(endpoint);
  return response.data;
}

// ── Audit Logs ──────────────────────────────────────────────────────────────
export async function getAuditLogs(query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', query.page);
  if (query.limit) params.set('limit', query.limit);
  if (query.action) params.set('action', query.action);
  const qs = params.toString();
  const endpoint = qs ? `/admin/audit-logs?${qs}` : '/admin/audit-logs';
  const response = await api.get(endpoint);
  return response.data;
}

export default {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  listAdmins,
  createAdmin,
  deactivateAdmin,
  getDashboardStats,
  getLiveStats,
  listUsers,
  getUserHistory,
  toggleUserStatus,
  deleteUser,
  listHelpers,
  approveHelper,
  suspendHelper,
  getHelperEarnings,
  listPendingKycs,
  getKycAuditHistory,
  approveKyc,
  rejectKyc,
  listAllBookings,
  adminCancelBooking,
  reassignHelper,
  listTransactions,
  getPlatformEarnings,
  processRefund,
  listTickets,
  assignTicket,
  resolveTicket,
  closeTicket,
  addTicketNote,
  listCoupons,
  createCoupon,
  updateCoupon,
  disableCoupon,
  deleteCoupon,
  getRevenueReport,
  getBookingReport,
  getHelperPerformanceReport,
  getCustomerGrowthReport,
  getCancellationReport,
  getAuditLogs,
};
