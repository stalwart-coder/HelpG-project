import * as bookingService from '../services/bookingService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * POST /api/bookings
 * Create a new booking (Customer).
 */
export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  return new ApiResponse(201, booking, 'Booking created successfully').send(res);
});

/**
 * GET /api/bookings/mine
 * Get current customer's bookings.
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getCustomerBookings(req.user._id, req.query);
  return new ApiResponse(200, result, 'Bookings retrieved successfully').send(res);
});

/**
 * GET /api/bookings/available
 * Get available (pending) bookings for helpers.
 */
export const getAvailableBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getAvailableBookings(req.query);
  return new ApiResponse(200, result, 'Available bookings retrieved successfully').send(res);
});

/**
 * GET /api/bookings/helper
 * Get bookings assigned to the current helper.
 */
export const getHelperBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getHelperBookings(req.user._id, req.query);
  return new ApiResponse(200, result, 'Helper bookings retrieved successfully').send(res);
});

/**
 * GET /api/bookings/:id
 * Get booking by ID.
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user._id);
  return new ApiResponse(200, booking, 'Booking retrieved successfully').send(res);
});

/**
 * PATCH /api/bookings/:id/status
 * Update booking status (Helper: accept/start/complete).
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const booking = await bookingService.updateBookingStatus(
    req.params.id,
    req.user._id,
    status,
    note
  );
  return new ApiResponse(200, booking, `Booking status updated to '${status}'`).send(res);
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking (Customer or Helper).
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason, notes } = req.body;
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id, {
    reason,
    notes,
  });
  return new ApiResponse(200, booking, 'Booking cancelled successfully').send(res);
});

/**
 * POST /api/bookings/:id/reschedule
 * Reschedule a booking (Customer only).
 */
export const rescheduleBooking = asyncHandler(async (req, res) => {
  const { newScheduledAt, reason } = req.body;
  const booking = await bookingService.rescheduleBooking(req.params.id, req.user._id, {
    newScheduledAt,
    reason,
  });
  return new ApiResponse(200, booking, 'Booking rescheduled successfully').send(res);
});

