import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/notifications — list all for the user
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count — quick count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

export default router;
