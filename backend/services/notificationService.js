/**
 * Push Notification Service
 *
 * Sends push notifications via Firebase Cloud Messaging (FCM).
 * Configure via environment variables:
 *   FCM_SERVER_KEY - Firebase Cloud Messaging server key
 *   FCM_PROJECT_ID - Firebase project ID
 *
 * In development, notifications are logged to console.
 */
import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

let fcmClient = null;

async function getFcmClient() {
  if (fcmClient) return fcmClient;

  if (env.isProd) {
    // In production, use firebase-admin or direct REST API with FCM server key
    // For now, we use the REST API approach
    fcmClient = {
      send: async (payload) => {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${env.notification.fcmServerKey}`,
          },
          body: JSON.stringify(payload),
        });
        return response.json();
      },
    };
  } else {
    fcmClient = {
      send: async (payload) => {
        logger.info('[DEV FCM]', {
          to: payload.to || payload.condition || 'topic',
          notification: payload.notification,
          data: payload.data,
        });
        return { success: true, messageId: `dev-${Date.now()}` };
      },
    };
  }

  return fcmClient;
}

/**
 * Send a push notification to a specific device.
 *
 * @param {string} token - FCM device token
 * @param {Object} notification - { title, body }
 * @param {Object} [data] - Optional data payload
 * @returns {Promise<Object>}
 */
export async function sendPushNotification(token, { title, body }, data = {}) {
  const client = await getFcmClient();

  const payload = {
    to: token,
    notification: { title, body },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
  };

  const result = await client.send(payload);

  logger.info('Push notification sent', {
    token: token.substring(0, 20) + '...',
    title,
    result: result.success ? 'success' : 'failed',
  });

  return result;
}

/**
 * Send a push notification to multiple devices.
 *
 * @param {string[]} tokens - Array of FCM device tokens
 * @param {Object} notification - { title, body }
 * @param {Object} [data] - Optional data payload
 * @returns {Promise<Object>}
 */
export async function sendMulticastNotification(tokens, { title, body }, data = {}) {
  const results = await Promise.allSettled(
    tokens.map((token) => sendPushNotification(token, { title, body }, data))
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  logger.info('Multicast notification sent', {
    total: tokens.length,
    succeeded,
    failed: tokens.length - succeeded,
  });

  return { total: tokens.length, succeeded, failed: tokens.length - succeeded };
}

/**
 * Send a push notification to a topic.
 *
 * @param {string} topic - FCM topic name
 * @param {Object} notification - { title, body }
 * @param {Object} [data] - Optional data payload
 * @returns {Promise<Object>}
 */
export async function sendTopicNotification(topic, { title, body }, data = {}) {
  const client = await getFcmClient();

  const payload = {
    condition: `'${topic}' in topics`,
    notification: { title, body },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
  };

  const result = await client.send(payload);

  logger.info('Topic notification sent', {
    topic,
    title,
  });

  return result;
}

/**
 * Create and persist a notification in the database.
 *
 * @param {Object} options
 * @param {string} options.userId - Recipient user ID
 * @param {string} options.type - Notification type (from Notification model enum)
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Additional data payload
 * @param {string} [options.channel='in_app'] - Delivery channel
 * @returns {Promise<Object>} Created notification document
 */
export async function createNotification({ userId, type, title, body, data = {}, channel = 'in_app' }) {
  const notification = await Notification.create({
    userId,
    type,
    title,
    body,
    data,
    channel,
  });

  logger.info('Notification created and stored', {
    userId,
    type,
    notificationId: notification._id,
  });

  return notification;
}

/**
 * Create and send (persist + push) a notification.
 *
 * @param {Object} options
 * @param {string} options.userId - Recipient user ID
 * @param {string} [options.fcmToken] - FCM token for push delivery
 * @param {string} options.type - Notification type
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Additional data payload
 * @returns {Promise<Object>}
 */
export async function notifyUser({ userId, fcmToken, type, title, body, data = {} }) {
  // Always persist in database
  const notification = await createNotification({ userId, type, title, body, data });

  // Send push if token available
  if (fcmToken) {
    try {
      await sendPushNotification(fcmToken, { title, body }, data);
    } catch (error) {
      logger.warn('Failed to send push notification', {
        userId,
        type,
        error: error.message,
      });
    }
  }

  return notification;
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadCount(userId) {
  return Notification.countDocuments({ userId, isRead: false });
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );

  return { modifiedCount: result.modifiedCount };
}

export default {
  sendPushNotification,
  sendMulticastNotification,
  sendTopicNotification,
  createNotification,
  notifyUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
