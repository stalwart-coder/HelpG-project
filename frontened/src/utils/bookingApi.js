/**
 * Booking API client.
 */
import api from './apiClient.js';

export async function createBooking(bookingData) {
  const response = await api.post('/bookings', bookingData);
  return response.data;
}

export async function getMyBookings(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.limit) params.set('limit', query.limit);
  if (query.skip) params.set('skip', query.skip);

  const qs = params.toString();
  const endpoint = qs ? `/bookings/mine?${qs}` : '/bookings/mine';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getAvailableBookings(query = {}) {
  const params = new URLSearchParams();
  if (query.limit) params.set('limit', query.limit);
  if (query.skip) params.set('skip', query.skip);

  const qs = params.toString();
  const endpoint = qs ? `/bookings/available?${qs}` : '/bookings/available';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getHelperBookings(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.limit) params.set('limit', query.limit);
  if (query.skip) params.set('skip', query.skip);

  const qs = params.toString();
  const endpoint = qs ? `/bookings/helper?${qs}` : '/bookings/helper';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getBookingById(id) {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
}

export async function updateBookingStatus(id, status, note = '') {
  const response = await api.patch(`/bookings/${id}/status`, { status, note });
  return response.data;
}

export async function cancelBooking(id, reason, notes = '') {
  const response = await api.post(`/bookings/${id}/cancel`, { reason, notes });
  return response.data;
}

export async function rescheduleBooking(id, newScheduledAt, reason = '') {
  const response = await api.post(`/bookings/${id}/reschedule`, { newScheduledAt, reason });
  return response.data;
}
