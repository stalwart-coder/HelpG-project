/**
 * Notification API client.
 */
import api from './apiClient.js';

/**
 * Get all notifications for the current user.
 * @param {Object} query - { limit, skip }
 * @returns {Promise<{notifications, total, unreadCount}>}
 */
export async function getNotifications(query = {}) {
  const params = new URLSearchParams(query).toString();
  const response = await api.get(`/notifications${params ? `?${params}` : ''}`);
  return response.data;
}

/**
 * Get unread notification count.
 * @returns {Promise<{count: number}>}
 */
export async function getUnreadCount() {
  const response = await api.get('/notifications/unread-count');
  return response.data;
}

/**
 * Mark a single notification as read.
 * @param {string} notificationId
 * @returns {Promise<Object>}
 */
export async function markAsRead(notificationId) {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
}

/**
 * Mark all notifications as read.
 * @returns {Promise<{modifiedCount: number}>}
 */
export async function markAllAsRead() {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}

/**
 * Delete a notification.
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function deleteNotification(notificationId) {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
}

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
