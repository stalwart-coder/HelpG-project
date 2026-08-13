import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import AuditLog from '../models/AuditLog.js';
import SupportTicket from '../models/SupportTicket.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import HelperProfile from '../models/HelperProfile.js';
import Transaction from '../models/Transaction.js';
import { generateAuthTokens } from './tokenService.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Build MongoDB sort object from query params.
 * Defaults to { createdAt: -1 } if no sort specified.
 */
function buildSort(query) {
  if (!query.sort) return { createdAt: -1 };
  const order = query.order === 'asc' ? 1 : -1;
  return { [query.sort]: order };
}

// ── Auth ────────────────────────────────────────────────────────────────────
export async function adminLogin(email, password) {
  const admin = await Admin.findOne({ email }).select('+password +refreshToken');
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!admin.isActive) {
    throw new ApiError(403, 'Account has been deactivated. Contact super admin.');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokens = generateAuthTokens(admin, 'admin');
  admin.refreshToken = tokens.refreshToken;
  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  await AuditLog.create({
    admin: admin._id,
    action: 'admin_login',
    resource: { type: 'system', description: 'Admin logged in' },
    severity: 'info',
  });

  return { admin: admin.toJSON(), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export async function getAdminProfile(adminId) {
  const admin = await Admin.findById(adminId);
  if (!admin) throw new ApiError(404, 'Admin not found');
  return admin;
}

export async function updateAdminProfile(adminId, updates) {
  const allowedFields = ['name'];
  const data = {};
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) data[key] = updates[key];
  });
  const admin = await Admin.findByIdAndUpdate(adminId, data, { new: true, runValidators: true });
  if (!admin) throw new ApiError(404, 'Admin not found');
  return admin;
}

// ── Admin Management (Super Admin) ──────────────────────────────────────────
export async function createAdmin(data, createdBy) {
  const existing = await Admin.findOne({ email: data.email });
  if (existing) throw new ApiError(409, 'Admin with this email already exists');
  const admin = await Admin.create({ ...data, createdBy });
  return admin;
}

export async function listAdmins(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  const [admins, total] = await Promise.all([
    Admin.find(filter).sort(buildSort(query)).skip(skip).limit(limit),
    Admin.countDocuments(filter),
  ]);
  return { admins, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function deactivateAdmin(adminId) {
  const admin = await Admin.findByIdAndUpdate(adminId, { isActive: false }, { new: true });
  if (!admin) throw new ApiError(404, 'Admin not found');
  return admin;
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalHelpers,
    activeBookings,
    completedBookings,
    cancelledBookings,
    pendingKyc,
    pendingRefunds,
    totalRevenue,
    totalCommission,
    todayUsers,
    todayBookings,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer', isActive: true }),
    User.countDocuments({ role: 'helper', isActive: true }),
    Booking.countDocuments({ status: { $in: ['confirmed', 'in_progress'] }, isActive: true }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    HelperProfile.countDocuments({ kycStatus: 'submitted' }),
    Transaction.countDocuments({ status: 'pending_refund' }),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    Booking.countDocuments({ createdAt: { $gte: startOfToday } }),
  ]);

  // Monthly revenue
  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: 'completed', updatedAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$platformFee' } } },
  ]);

  return {
    totalUsers,
    totalHelpers,
    activeBookings,
    completedBookings,
    cancelledBookings,
    pendingKyc,
    pendingRefunds,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    monthlyRevenue: monthlyRevenue[0]?.total || 0,
    monthlyCommission: monthlyRevenue[0]?.commission || 0,
    todayRegistrations: todayUsers,
    todayBookings,
  };
}

export async function getLiveStats() {
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const [activeSessions, ongoingTasks, pendingBookings] = await Promise.all([
    User.countDocuments({ lastLoginAt: { $gte: fiveMinAgo }, isActive: true }),
    Booking.countDocuments({ status: 'in_progress' }),
    Booking.countDocuments({ status: 'pending', isActive: true }),
  ]);

  return { activeSessions, ongoingTasks, pendingBookings, timestamp: now };
}

// ── User Management ─────────────────────────────────────────────────────────
export async function listUsers(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.isKycVerified !== undefined) filter.isKycVerified = query.isKycVerified === 'true';

  const [users, total] = await Promise.all([
    User.find(filter).sort(buildSort(query)).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function toggleUserStatus(userId, isActive, reason, adminId) {
  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');

  await AuditLog.create({
    admin: adminId,
    action: isActive ? 'user_unblocked' : 'user_blocked',
    resource: { type: 'user', id: userId, description: reason || (isActive ? 'User unblocked' : 'User blocked') },
    severity: isActive ? 'info' : 'warning',
  });

  logger.info(`User ${isActive ? 'unblocked' : 'blocked'}`, { userId, adminId, reason });
  return user;
}

export async function deleteUser(userId, reason, adminId) {
  const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');

  await AuditLog.create({
    admin: adminId,
    action: 'user_deleted',
    resource: { type: 'user', id: userId, description: reason || 'User deleted by admin' },
    severity: 'critical',
  });

  logger.info('User deleted', { userId, adminId, reason });
  return user;
}

export async function getUserHistory(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const [bookings, transactions, tickets] = await Promise.all([
    Booking.find({ customer: userId }).sort({ createdAt: -1 }).limit(50),
    Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(50),
    SupportTicket.find({ user: userId }).sort({ createdAt: -1 }).limit(20),
  ]);

  return { user, bookings, transactions, tickets };
}

// ── Helper Management ───────────────────────────────────────────────────────
export async function listHelpers(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  const filter = { role: 'helper' };

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.isKycVerified !== undefined) filter.isKycVerified = query.isKycVerified === 'true';

  const [users, total] = await Promise.all([
    User.find(filter).sort(buildSort(query)).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  // Fetch helper profiles
  const userIds = users.map((u) => u._id);
  const profiles = await HelperProfile.find({ userId: { $in: userIds } });
  const profileMap = {};
  profiles.forEach((p) => { profileMap[p.userId.toString()] = p; });

  const helpers = users.map((u) => ({
    ...u.toJSON(),
    helperProfile: profileMap[u._id.toString()] || null,
  }));

  return { helpers, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function approveHelper(helperId, adminId) {
  const user = await User.findById(helperId);
  if (!user || user.role !== 'helper') throw new ApiError(404, 'Helper not found');

  let profile = await HelperProfile.findOne({ userId: helperId });
  if (profile) {
    profile.kycStatus = 'verified';
    await profile.save();
  }
  user.isKycVerified = true;
  await user.save();

  await AuditLog.create({
    admin: adminId,
    action: 'helper_approved',
    resource: { type: 'helper', id: helperId, description: 'Helper approved' },
    severity: 'info',
  });

  return { user, profile };
}

export async function suspendHelper(helperId, reason, adminId) {
  const user = await User.findByIdAndUpdate(helperId, { isActive: false }, { new: true });
  if (!user || user.role !== 'helper') throw new ApiError(404, 'Helper not found');

  await AuditLog.create({
    admin: adminId,
    action: 'helper_suspended',
    resource: { type: 'helper', id: helperId, description: reason },
    severity: 'warning',
  });

  logger.info('Helper suspended', { helperId, adminId, reason });
  return user;
}

export async function getHelperEarnings(helperId) {
  const earnings = await Transaction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(helperId), type: 'earning', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  const transactions = await Transaction.find({ user: helperId })
    .sort({ createdAt: -1 })
    .limit(100);

  return {
    totalEarnings: earnings[0]?.total || 0,
    completedPayouts: earnings[0]?.count || 0,
    transactions,
  };
}

// ── KYC Management ──────────────────────────────────────────────────────────
export async function listPendingKycs(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;
  const statusFilter = query.status || 'submitted';

  const filter = { kycStatus: statusFilter };
  const [kycs, total] = await Promise.all([
    HelperProfile.find(filter)
      .populate('userId', 'name email phone')
      .sort(buildSort(query))
      .skip(skip)
      .limit(limit),
    HelperProfile.countDocuments(filter),
  ]);

  return { kycs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function approveKyc(userId, adminId) {
  const profile = await HelperProfile.findOne({ userId });
  if (!profile) throw new ApiError(404, 'KYC not found');
  if (profile.kycStatus === 'verified') throw new ApiError(400, 'KYC already verified');

  profile.kycStatus = 'verified';
  await profile.save();
  await User.findByIdAndUpdate(userId, { isKycVerified: true });

  await AuditLog.create({
    admin: adminId,
    action: 'kyc_approved',
    resource: { type: 'kyc', id: userId, description: 'KYC approved' },
    severity: 'info',
  });

  return profile;
}

export async function rejectKyc(userId, reason, adminId) {
  const profile = await HelperProfile.findOne({ userId });
  if (!profile) throw new ApiError(404, 'KYC not found');
  if (profile.kycStatus === 'verified') throw new ApiError(400, 'KYC already verified');

  profile.kycStatus = 'rejected';
  await profile.save();

  await AuditLog.create({
    admin: adminId,
    action: 'kyc_rejected',
    resource: { type: 'kyc', id: userId, description: reason },
    severity: 'warning',
  });

  return profile;
}

export async function getKycAuditHistory() {
  const logs = await AuditLog.find({ 'resource.type': 'kyc' })
    .populate('admin', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);
  return logs;
}

// ── Booking Management ──────────────────────────────────────────────────────
export async function listAllBookings(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.search) filter.title = new RegExp(query.search, 'i');

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('helper', 'name email phone')
      .sort(buildSort(query))
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);
  return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function adminCancelBooking(bookingId, reason, adminId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  booking.status = 'cancelled';
  booking.cancellation = {
    reason,
    cancelledAt: new Date(),
    cancelledBy: 'system',
  };
  booking.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Cancelled by admin: ${reason}`,
    by: 'system',
  });
  await booking.save();

  await AuditLog.create({
    admin: adminId,
    action: 'booking_cancelled',
    resource: { type: 'booking', id: bookingId, description: reason },
    severity: 'warning',
  });

  return booking;
}

export async function reassignHelper(bookingId, newHelperId, adminId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw new ApiError(400, 'Can only reassign pending or confirmed bookings');
  }

  const newHelper = await User.findById(newHelperId);
  if (!newHelper || newHelper.role !== 'helper') throw new ApiError(404, 'Helper not found');

  booking.helper = newHelperId;
  booking.timeline.push({
    status: booking.status,
    timestamp: new Date(),
    note: `Helper reassigned to ${newHelper.name} by admin`,
    by: 'system',
  });
  await booking.save();

  await AuditLog.create({
    admin: adminId,
    action: 'booking_reassigned',
    resource: { type: 'booking', id: bookingId, description: `Reassigned to ${newHelper.name}` },
    severity: 'info',
  });

  return booking;
}

// ── Payment Management ──────────────────────────────────────────────────────
export async function listTransactions(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;

  const [transactions, total, totalAmount] = await Promise.all([
    Transaction.find(filter)
      .populate('user', 'name email phone')
      .sort(buildSort(query))
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return { transactions, total, page, limit, totalPages: Math.ceil(total / limit), totalAmount: totalAmount[0]?.total || 0 };
}

export async function processRefund(transactionId, reason, adminId) {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new ApiError(404, 'Transaction not found');
  if (transaction.status === 'refunded') throw new ApiError(400, 'Already refunded');

  transaction.status = 'refunded';
  transaction.metadata = { ...transaction.metadata, refundReason: reason, refundedBy: adminId, refundedAt: new Date() };
  await transaction.save();

  const refundTxn = await Transaction.create({
    user: transaction.user,
    type: 'refund',
    amount: transaction.amount,
    status: 'completed',
    description: `Refund: ${reason}`,
    metadata: { originalTransaction: transaction._id, processedBy: adminId },
  });

  await AuditLog.create({
    admin: adminId,
    action: 'refund_processed',
    resource: { type: 'payment', id: transactionId, description: reason },
    severity: 'info',
  });

  return { originalTransaction, refundTransaction: refundTxn };
}

export async function getPlatformEarnings(query = {}) {
  const match = { status: 'completed' };
  if (query.from) match.updatedAt = { $gte: new Date(query.from) };
  if (query.to) match.updatedAt = { ...match.updatedAt, $lte: new Date(query.to) };

  const [totalRevenue, totalCommission, monthlyStats] = await Promise.all([
    Booking.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Booking.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$platformFee' } } }]),
    Booking.aggregate([
      { $match: { ...match, updatedAt: { $gte: new Date(new Date().setDate(1)) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, revenue: { $sum: '$totalAmount' }, commission: { $sum: '$platformFee' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { totalRevenue: totalRevenue[0]?.total || 0, totalCommission: totalCommission[0]?.total || 0, dailyStats: monthlyStats };
}

// ── Support Ticket Management ───────────────────────────────────────────────
export async function listTickets(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort(buildSort(query))
      .skip(skip)
      .limit(limit),
    SupportTicket.countDocuments(filter),
  ]);
  return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function assignTicket(ticketId, adminId, assignedBy) {
  const ticket = await SupportTicket.findByIdAndUpdate(
    ticketId,
    { assignedTo: adminId, status: 'assigned', assignedAt: new Date() },
    { new: true }
  );
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  await AuditLog.create({
    admin: assignedBy,
    action: 'ticket_assigned',
    resource: { type: 'ticket', id: ticketId, description: `Assigned to admin ${adminId}` },
    severity: 'info',
  });

  return ticket;
}

export async function resolveTicket(ticketId, resolution, adminId) {
  const ticket = await SupportTicket.findByIdAndUpdate(
    ticketId,
    { status: 'resolved', resolution, resolvedAt: new Date() },
    { new: true }
  );
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  await AuditLog.create({
    admin: adminId,
    action: 'ticket_resolved',
    resource: { type: 'ticket', id: ticketId, description: resolution.substring(0, 100) },
    severity: 'info',
  });

  return ticket;
}

export async function closeTicket(ticketId, adminId) {
  const ticket = await SupportTicket.findByIdAndUpdate(
    ticketId,
    { status: 'closed', closedAt: new Date() },
    { new: true }
  );
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  await AuditLog.create({
    admin: adminId,
    action: 'ticket_closed',
    resource: { type: 'ticket', id: ticketId, description: 'Ticket closed' },
    severity: 'info',
  });

  return ticket;
}

export async function addTicketNote(ticketId, note, adminId) {
  const ticket = await SupportTicket.findByIdAndUpdate(
    ticketId,
    { $push: { notes: { text: note, addedBy: adminId } } },
    { new: true }
  );
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  return ticket;
}

// ── Coupon Management ───────────────────────────────────────────────────────
export async function createCoupon(data, adminId) {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) throw new ApiError(409, 'Coupon code already exists');
  const coupon = await Coupon.create({ ...data, createdBy: adminId });

  await AuditLog.create({
    admin: adminId,
    action: 'coupon_created',
    resource: { type: 'coupon', id: coupon._id, description: `Coupon ${coupon.code} created` },
    severity: 'info',
  });

  return coupon;
}

export async function updateCoupon(couponId, data, adminId) {
  if (data.code) data.code = data.code.toUpperCase();
  const coupon = await Coupon.findByIdAndUpdate(couponId, data, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');

  await AuditLog.create({
    admin: adminId,
    action: 'coupon_edited',
    resource: { type: 'coupon', id: couponId, description: 'Coupon updated' },
    severity: 'info',
  });

  return coupon;
}

export async function disableCoupon(couponId, adminId) {
  const coupon = await Coupon.findByIdAndUpdate(couponId, { status: 'disabled' }, { new: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');

  await AuditLog.create({
    admin: adminId,
    action: 'coupon_disabled',
    resource: { type: 'coupon', id: couponId, description: `Coupon ${coupon.code} disabled` },
    severity: 'info',
  });

  return coupon;
}

export async function deleteCoupon(couponId, adminId) {
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) throw new ApiError(404, 'Coupon not found');

  await AuditLog.create({
    admin: adminId,
    action: 'coupon_deleted',
    resource: { type: 'coupon', id: couponId, description: `Coupon ${coupon.code} deleted` },
    severity: 'critical',
  });

  return { message: 'Coupon deleted' };
}

export async function listCoupons(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort(buildSort(query)).skip(skip).limit(limit),
    Coupon.countDocuments(filter),
  ]);
  return { coupons, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Reports ─────────────────────────────────────────────────────────────────
export async function getRevenueReport(query = {}) {
  const from = query.from ? new Date(query.from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to = query.to ? new Date(query.to) : new Date();
  const match = { status: 'completed', updatedAt: { $gte: from, $lte: to } };

  const [dailyRevenue, categoryBreakdown] = await Promise.all([
    Booking.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, revenue: { $sum: '$totalAmount' }, commission: { $sum: '$platformFee' }, bookings: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Booking.aggregate([
      { $match: match },
      { $group: { _id: '$category', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0);
  const totalCommission = dailyRevenue.reduce((s, d) => s + d.commission, 0);
  const totalBookings = dailyRevenue.reduce((s, d) => s + d.bookings, 0);

  return { totalRevenue, totalCommission, totalBookings, dailyRevenue, categoryBreakdown, from, to };
}

export async function getBookingReport(query = {}) {
  const from = query.from ? new Date(query.from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to = query.to ? new Date(query.to) : new Date();
  const match = { createdAt: { $gte: from, $lte: to } };

  const [statusBreakdown, dailyBookings] = await Promise.all([
    Booking.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { statusBreakdown, dailyBookings, from, to };
}

export async function getHelperPerformanceReport(query = {}) {
  const from = query.from ? new Date(query.from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to = query.to ? new Date(query.to) : new Date();

  const topHelpers = await Booking.aggregate([
    { $match: { status: 'completed', updatedAt: { $gte: from, $lte: to }, helper: { $ne: null } } },
    { $group: { _id: '$helper', completed: { $sum: 1 }, totalEarnings: { $sum: '$totalAmount' } } },
    { $sort: { completed: -1 } },
    { $limit: 20 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $project: { 'user.name': 1, 'user.email': 1, 'user.phone': 1, completed: 1, totalEarnings: 1 } },
  ]);

  return { topHelpers, from, to };
}

export async function getCustomerGrowthReport(query = {}) {
  const from = query.from ? new Date(query.from) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  const to = query.to ? new Date(query.to) : new Date();

  const growth = await User.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, customers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } }, helpers: { $sum: { $cond: [{ $eq: ['$role', 'helper'] }, 1, 0] } }, total: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return { growth, from, to };
}

export async function getCancellationReport(query = {}) {
  const from = query.from ? new Date(query.from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to = query.to ? new Date(query.to) : new Date();

  const cancellations = await Booking.aggregate([
    { $match: { status: 'cancelled', updatedAt: { $gte: from, $lte: to } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 }, byCustomer: { $sum: { $cond: [{ $eq: ['$cancellation.cancelledBy', 'customer'] }, 1, 0] } }, byHelper: { $sum: { $cond: [{ $eq: ['$cancellation.cancelledBy', 'helper'] }, 1, 0] } }, bySystem: { $sum: { $cond: [{ $eq: ['$cancellation.cancelledBy', 'system'] }, 1, 0] } } } },
    { $sort: { _id: 1 } },
  ]);

  const totalCancelled = cancellations.reduce((s, d) => s + d.count, 0);
  return { cancellations, totalCancelled, from, to };
}

// ── Audit Logs ──────────────────────────────────────────────────────────────
export async function getAuditLogs(query = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 50);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.action) filter.action = query.action;
  if (query.resourceType) filter['resource.type'] = query.resourceType;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
