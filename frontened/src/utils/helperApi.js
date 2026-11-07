/**
 * Helper API client.
 * Calls real backend endpoints and returns API response data.
 */
import api from './apiClient.js';

export async function getHelperProfile() {
  const response = await api.get('/helpers/profile');
  return response.data;
}

export async function updateHelperProfile(profileData) {
  const response = await api.patch('/helpers/profile', profileData);
  return response.data;
}

export async function getHelperDashboard() {
  const response = await api.get('/helpers/dashboard');
  return response.data;
}

export async function acceptBooking(bookingId, note = '') {
  const response = await api.patch(`/helpers/bookings/${bookingId}/accept`, { note });
  return response.data;
}

export async function rejectBooking(bookingId, reason = '') {
  const response = await api.patch(`/helpers/bookings/${bookingId}/reject`, { reason });
  return response.data;
}

export async function startTask(bookingId, note = '') {
  const response = await api.patch(`/helpers/bookings/${bookingId}/start`, { note });
  return response.data;
}

export async function markArrived(bookingId, note = '') {
  const response = await api.patch(`/helpers/bookings/${bookingId}/arrived`, { note });
  return response.data;
}

export async function completeTask(bookingId, note = '') {
  const response = await api.patch(`/helpers/bookings/${bookingId}/complete`, { note });
  return response.data;
}

export async function getAvailability() {
  const response = await api.get('/helpers/availability');
  return response.data;
}

export async function toggleAvailability(isAvailable) {
  const response = await api.patch('/helpers/availability', { isAvailable });
  return response.data;
}

export async function getSchedule() {
  const response = await api.get('/helpers/schedule');
  return response.data;
}

export async function updateSchedule(scheduleData) {
  const response = await api.put('/helpers/schedule', scheduleData);
  return response.data;
}

export async function getServiceAreas() {
  const response = await api.get('/helpers/service-areas');
  return response.data;
}

export async function addServiceArea(areaData) {
  const response = await api.post('/helpers/service-areas', areaData);
  return response.data;
}

export async function updateServiceArea(areaId, areaData) {
  const response = await api.patch(`/helpers/service-areas/${areaId}`, areaData);
  return response.data;
}

export async function removeServiceArea(areaId) {
  const response = await api.delete(`/helpers/service-areas/${areaId}`);
  return response.data;
}

export async function getEarningsSummary() {
  const response = await api.get('/helpers/earnings');
  return response.data;
}

export async function getEarningsHistory(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/helpers/earnings/history?${params}` : '/helpers/earnings/history';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getBookingHistory(query = {}) {
  const params = new URLSearchParams(query).toString();
  const endpoint = params ? `/helpers/booking-history?${params}` : '/helpers/booking-history';
  const response = await api.get(endpoint);
  return response.data;
}

export async function getWalletBalance() {
  const response = await api.get('/helpers/wallet');
  return response.data;
}

export async function requestWithdrawal(data) {
  const response = await api.post('/helpers/withdraw', data);
  return response.data;
}

export async function getWithdrawalHistory(query = {}) {
  const params = new URLSearchParams(query).toString();
  const response = await api.get(`/helpers/withdrawals${params ? `?${params}` : ''}`);
  return response.data;
}

export async function getNearbyHelpers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const endpoint = qs ? `/helpers/nearby?${qs}` : '/helpers/nearby';
  const response = await api.get(endpoint);
  return response.data;
}

export default {
  getHelperProfile,
  updateHelperProfile,
  getHelperDashboard,
  acceptBooking,
  rejectBooking,
  startTask,
  markArrived,
  completeTask,
  getAvailability,
  toggleAvailability,
  getSchedule,
  updateSchedule,
  getServiceAreas,
  addServiceArea,
  updateServiceArea,
  removeServiceArea,
  getEarningsSummary,
  getEarningsHistory,
  getBookingHistory,
  getWalletBalance,
  requestWithdrawal,
  getWithdrawalHistory,
  getNearbyHelpers,
};
