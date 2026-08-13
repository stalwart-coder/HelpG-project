import Booking from '../models/Booking.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * @typedef {'pending'|'confirmed'|'in_progress'|'completed'|'cancelled'} BookingStatus
 */

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'pending'], // pending for reschedule
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * Validate that a status transition is allowed.
 */
function assertValidTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new ApiError(
      400,
      `Cannot transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${(allowed || []).join(', ') || 'none'}`
    );
  }
}

/**
 * Create a new booking (Customer only).
 */
export async function createBooking(customerId, bookingData) {
  const customer = await User.findById(customerId);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  if (customer.role !== 'customer') {
    throw new ApiError(403, 'Only customers can create bookings');
  }

  const booking = await Booking.create({
    customer: customerId,
    category: bookingData.category,
    title: bookingData.title,
    description: bookingData.description || '',
    location: bookingData.location,
    scheduledAt: new Date(bookingData.scheduledAt),
    duration: bookingData.duration || 'onetime',
    price: bookingData.price,
    platformFee: bookingData.platformFee || Math.round(bookingData.price * 0.05),
    totalAmount: bookingData.totalAmount || bookingData.price,
    timeline: [
      {
        status: 'pending',
        timestamp: new Date(),
        note: 'Booking created',
        by: 'customer',
      },
    ],
  });

  logger.info('Booking created', { bookingId: booking._id, customerId });
  return booking;
}

/**
 * Get booking by ID. Only the customer or assigned helper can view.
 */
export async function getBookingById(bookingId, userId) {
  const booking = await Booking.findById(bookingId)
    .populate('customer', 'name email phone avatar')
    .populate('helper', 'name email phone avatar');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Authorization: must be customer, assigned helper, or admin
  const isCustomer = booking.customer._id.toString() === userId;
  const isHelper = booking.helper && booking.helper._id.toString() === userId;
  const isAdmin = false; // future

  if (!isCustomer && !isHelper && !isAdmin) {
    throw new ApiError(403, 'You do not have access to this booking');
  }

  return booking;
}

/**
 * Get all bookings for the current customer.
 */
export async function getCustomerBookings(customerId, query = {}) {
  const filter = { customer: customerId, isActive: true };

  if (query.status) {
    filter.status = query.status;
  }

  const bookings = await Booking.find(filter)
    .populate('helper', 'name email phone avatar')
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(query.limit, 10) || 50, 100))
    .skip(parseInt(query.skip, 10) || 0);

  const total = await Booking.countDocuments(filter);

  return { bookings, total };
}

/**
 * Get all bookings assigned to the current helper.
 */
export async function getHelperBookings(helperId, query = {}) {
  const filter = { helper: helperId, isActive: true };

  if (query.status) {
    filter.status = query.status;
  }

  const bookings = await Booking.find(filter)
    .populate('customer', 'name email phone avatar')
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(query.limit, 10) || 50, 100))
    .skip(parseInt(query.skip, 10) || 0);

  const total = await Booking.countDocuments(filter);

  return { bookings, total };
}

/**
 * Get available (pending) bookings that helpers can accept.
 */
export async function getAvailableBookings(query = {}) {
  const filter = { status: 'pending', isActive: true };

  const bookings = await Booking.find(filter)
    .populate('customer', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(query.limit, 10) || 50, 100))
    .skip(parseInt(query.skip, 10) || 0);

  const total = await Booking.countDocuments(filter);

  return { bookings, total };
}

/**
 * Update booking status. Used by helpers to accept/start/complete.
 * Also used internally for cancellations.
 */
export async function updateBookingStatus(bookingId, userId, newStatus, note = '') {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  assertValidTransition(booking.status, newStatus);

  // Authorization: only helper or customer can update
  const isHelper = booking.helper && booking.helper.toString() === userId;
  const isCustomer = booking.customer.toString() === userId;

  if (!isHelper && !isCustomer) {
    throw new ApiError(403, 'You do not have permission to update this booking');
  }

  // If helper is accepting (confirmed), assign them
  if (newStatus === 'confirmed') {
    if (!isHelper) {
      throw new ApiError(403, 'Only a helper can accept a booking');
    }
    booking.helper = userId;
  }

  // Only helpers can mark as in_progress or completed
  if (newStatus === 'in_progress' || newStatus === 'completed') {
    if (!isHelper) {
      throw new ApiError(403, 'Only the assigned helper can update to this status');
    }
  }

  booking.status = newStatus;
  booking.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status updated to ${newStatus}`,
    by: isHelper ? 'helper' : 'customer',
  });

  await booking.save();

  logger.info('Booking status updated', {
    bookingId,
    newStatus,
    userId,
  });

  return booking;
}

/**
 * Cancel a booking (Customer only before acceptance, or helper).
 */
export async function cancelBooking(bookingId, userId, { reason, notes = '' }) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const isCustomer = booking.customer.toString() === userId;
  const isHelper = booking.helper && booking.helper.toString() === userId;

  if (!isCustomer && !isHelper) {
    throw new ApiError(403, 'You do not have permission to cancel this booking');
  }

  // Only allow cancellation from pending, confirmed, or in_progress
  if (!['pending', 'confirmed', 'in_progress'].includes(booking.status)) {
    throw new ApiError(400, `Cannot cancel a booking with status '${booking.status}'`);
  }

  booking.status = 'cancelled';
  booking.cancellation = {
    reason,
    notes,
    cancelledAt: new Date(),
    cancelledBy: isCustomer ? 'customer' : 'helper',
  };
  booking.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Cancelled by ${isCustomer ? 'customer' : 'helper'}: ${reason}`,
    by: isCustomer ? 'customer' : 'helper',
  });

  await booking.save();

  logger.info('Booking cancelled', {
    bookingId,
    cancelledBy: isCustomer ? 'customer' : 'helper',
    userId,
    reason,
  });

  return booking;
}

/**
 * Reschedule a booking (Customer only).
 */
export async function rescheduleBooking(bookingId, userId, { newScheduledAt, reason = '' }) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const isCustomer = booking.customer.toString() === userId;

  if (!isCustomer) {
    throw new ApiError(403, 'Only the customer can reschedule a booking');
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw new ApiError(
      400,
      `Cannot reschedule a booking with status '${booking.status}'. Only pending or confirmed bookings can be rescheduled.`
    );
  }

  const previousDate = booking.scheduledAt;
  const newDate = new Date(newScheduledAt);

  // Store reschedule history
  booking.rescheduleHistory.push({
    previousDate,
    newDate,
    rescheduledAt: new Date(),
    reason,
  });

  // Update the scheduled time
  booking.scheduledAt = newDate;

  // If it was confirmed, keep it confirmed
  booking.timeline.push({
    status: booking.status,
    timestamp: new Date(),
    note: `Rescheduled from ${previousDate.toISOString()} to ${newDate.toISOString()}. Reason: ${reason || 'Not specified'}`,
    by: 'customer',
  });

  await booking.save();

  logger.info('Booking rescheduled', {
    bookingId,
    previousDate,
    newDate,
    userId,
  });

  return booking;
}

