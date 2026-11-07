import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Notification from '../models/Notification.js';
import * as notificationService from '../services/notificationService.js';

/**
 * Get all notifications for the authenticated user.
 * GET /api/notifications
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
  const skip = parseInt(req.query.skip, 10) || 0;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Notification.countDocuments({ userId });
  const unreadCount = await notificationService.getUnreadCount(userId);

  res.json(
    new ApiResponse(200, { notifications, total, unreadCount }, 'Notifications fetched')
  );
});

/**
 * Get unread count.
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.json(new ApiResponse(200, { count }, 'Unread count fetched'));
});

/**
 * Mark a single notification as read.
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  res.json(new ApiResponse(200, notification, 'Notification marked as read'));
});

/**
 * Mark all notifications as read.
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.json(new ApiResponse(200, result, 'All notifications marked as read'));
});

/**
 * Delete a notification.
 * DELETE /api/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await notification.deleteOne();
  res.json(new ApiResponse(200, null, 'Notification deleted'));
});
