import * as helperService from '../services/helperService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

// ═════════════════════════════════════════════════════════════════════════════
// 1. HELPER PROFILE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/helpers/profile
 * Get the current helper's profile.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const data = await helperService.getHelperProfile(req.user._id);
  return new ApiResponse(200, data, 'Helper profile retrieved successfully').send(res);
});

/**
 * PATCH /api/helpers/profile
 * Update the current helper's profile.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await helperService.updateHelperProfile(req.user._id, req.body);
  return new ApiResponse(200, profile, 'Helper profile updated successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. HELPER DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/helpers/dashboard
 * Get dashboard data.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const data = await helperService.getDashboard(req.user._id);
  return new ApiResponse(200, data, 'Dashboard retrieved successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. ACCEPT BOOKING
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/helpers/bookings/:id/accept
 * Accept a pending booking.
 */
export const acceptBooking = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const booking = await helperService.acceptBooking(req.params.id, req.user._id, note);
  return new ApiResponse(200, booking, 'Booking accepted successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. REJECT BOOKING
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/helpers/bookings/:id/reject
 * Reject a pending booking.
 */
export const rejectBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await helperService.rejectBooking(req.params.id, req.user._id, reason);
  return new ApiResponse(200, booking, 'Booking rejected').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. START TASK
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/helpers/bookings/:id/start
 * Start a confirmed task.
 */
export const startTask = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const booking = await helperService.startTask(req.params.id, req.user._id, note);
  return new ApiResponse(200, booking, 'Task started successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. MARK ARRIVED
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/helpers/bookings/:id/arrived
 * Mark helper as arrived at location.
 */
export const markArrived = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const booking = await helperService.markArrived(req.params.id, req.user._id, note);
  return new ApiResponse(200, booking, 'Arrival marked successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 7. COMPLETE TASK
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/helpers/bookings/:id/complete
 * Complete an in-progress task.
 */
export const completeTask = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const booking = await helperService.completeTask(req.params.id, req.user._id, note);
  return new ApiResponse(200, booking, 'Task completed successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 8. AVAILABILITY TOGGLE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * PATCH /api/helpers/availability
 * Toggle availability on/off.
 */
export const toggleAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;
  const availability = await helperService.toggleAvailability(req.user._id, isAvailable);
  return new ApiResponse(200, availability, `Availability ${isAvailable ? 'enabled' : 'disabled'} successfully`).send(res);
});

/**
 * GET /api/helpers/availability
 * Get current availability status.
 */
export const getAvailability = asyncHandler(async (req, res) => {
  const availability = await helperService.getAvailability(req.user._id);
  return new ApiResponse(200, availability, 'Availability retrieved successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 9. WORKING SCHEDULE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/helpers/schedule
 * Get working schedule.
 */
export const getSchedule = asyncHandler(async (req, res) => {
  const data = await helperService.getSchedule(req.user._id);
  return new ApiResponse(200, data, 'Schedule retrieved successfully').send(res);
});

/**
 * PUT /api/helpers/schedule
 * Update working schedule.
 */
export const updateSchedule = asyncHandler(async (req, res) => {
  const data = await helperService.updateSchedule(req.user._id, req.body);
  return new ApiResponse(200, data, 'Schedule updated successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 10. SERVICE AREA
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/helpers/service-areas
 * Add a service area.
 */
export const addServiceArea = asyncHandler(async (req, res) => {
  const area = await helperService.addServiceArea(req.user._id, req.body);
  return new ApiResponse(201, area, 'Service area added successfully').send(res);
});

/**
 * GET /api/helpers/service-areas
 * Get all service areas.
 */
export const getServiceAreas = asyncHandler(async (req, res) => {
  const areas = await helperService.getServiceAreas(req.user._id);
  return new ApiResponse(200, areas, 'Service areas retrieved successfully').send(res);
});

/**
 * DELETE /api/helpers/service-areas/:id
 * Remove a service area.
 */
export const removeServiceArea = asyncHandler(async (req, res) => {
  const area = await helperService.removeServiceArea(req.params.id, req.user._id);
  return new ApiResponse(200, area, 'Service area removed successfully').send(res);
});

/**
 * PATCH /api/helpers/service-areas/:id
 * Update a service area.
 */
export const updateServiceArea = asyncHandler(async (req, res) => {
  const area = await helperService.updateServiceArea(req.params.id, req.user._id, req.body);
  return new ApiResponse(200, area, 'Service area updated successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 11. EARNINGS SUMMARY
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/helpers/earnings
 * Get earnings summary.
 */
export const getEarningsSummary = asyncHandler(async (req, res) => {
  const data = await helperService.getEarningsSummary(req.user._id);
  return new ApiResponse(200, data, 'Earnings summary retrieved successfully').send(res);
});

/**
 * GET /api/helpers/earnings/history
 * Get earnings history (transactions).
 */
export const getEarningsHistory = asyncHandler(async (req, res) => {
  const data = await helperService.getEarningsHistory(req.user._id, req.query);
  return new ApiResponse(200, data, 'Earnings history retrieved successfully').send(res);
});

// ═════════════════════════════════════════════════════════════════════════════
// 12. BOOKING HISTORY
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/helpers/bookings
 * Get booking history for the helper.
 */
export const getBookingHistory = asyncHandler(async (req, res) => {
  const data = await helperService.getBookingHistory(req.user._id, req.query);
  return new ApiResponse(200, data, 'Booking history retrieved successfully').send(res);
});

