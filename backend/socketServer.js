/**
 * Socket.IO Server for real-time chat.
 *
 * @param {import('http').Server} httpServer - HTTP server instance
 */
import { Server } from 'socket.io';
import { verifyAccessToken } from './services/tokenService.js';
import * as chatService from './services/chatService.js';
import logger from './utils/logger.js';
import env from './config/env.js';

const userSockets = new Map(); // userId -> Set<socketId>
const socketUsers = new Map(); // socketId -> userId
const onlineHelpers = new Map(); // userId -> { userId, name, avatar, rating, lat, lng, locality, vehicle, isAvailable }

let ioInstance = null;

/**
 * Initialize Socket.IO with the HTTP server.
 */
export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => cb(null, true), // Allow frontend
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  ioInstance = io;

  // ── Authentication middleware ──────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);

      if (typeof decoded?.id !== 'string') {
        return next(new Error('Invalid token payload'));
      }

      socket.userId = decoded.id;
      socket.userRole = decoded.role || 'unknown';
      next();
    } catch (error) {
      logger.warn('Socket authentication failed', {
        error: error.message,
      });
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;

    // Track user connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socketUsers.set(socket.id, userId);

    logger.info('Socket connected', {
      userId,
      socketId: socket.id,
      role: userRole,
      activeConnections: userSockets.get(userId).size,
    });

    // Join a personal room for direct messaging & notifications
    socket.join(`user:${userId}`);

    // If helper, join helpers channel
    if (userRole === 'helper') {
      socket.join('role:helper');
    }

    // ── Helper Online Status & GPS Location ────────────────────────────
    socket.on('helper:status', (data) => {
      const { isAvailable, lat, lng, locality, name, avatar, rating, vehicle } = data || {};
      if (userRole === 'helper') {
        if (isAvailable) {
          onlineHelpers.set(userId, {
            userId,
            socketId: socket.id,
            isAvailable: true,
            lat: Number(lat) || 12.9352,
            lng: Number(lng) || 77.6245,
            locality: locality || 'Koramangala, Bengaluru',
            name: name || 'Partner',
            avatar: avatar || '',
            rating: rating || 4.8,
            vehicle: vehicle || 'scooter',
            updatedAt: Date.now(),
          });
          // Broadcast to customer radar
          io.emit('helper:nearby_update', Array.from(onlineHelpers.values()));
        } else {
          onlineHelpers.delete(userId);
          io.emit('helper:nearby_update', Array.from(onlineHelpers.values()));
        }
      }
    });

    // Helper live GPS location streaming (for Uber-like tracking)
    socket.on('helper:location:update', (data) => {
      const { lat, lng, bookingId, speed, heading } = data || {};
      if (userRole === 'helper' && onlineHelpers.has(userId)) {
        const helper = onlineHelpers.get(userId);
        helper.lat = Number(lat) || helper.lat;
        helper.lng = Number(lng) || helper.lng;
        helper.updatedAt = Date.now();
        onlineHelpers.set(userId, helper);
      }

      // If active booking, stream to booking room (customer sees helper moving on map)
      if (bookingId) {
        io.to(`booking:${bookingId}`).emit('booking:helper_location', {
          helperId: userId,
          bookingId,
          lat,
          lng,
          speed,
          heading,
          timestamp: Date.now(),
        });
      }
    });

    // ── Customer Radar Scan (Find Drivers/Helpers in Proximity) ────────
    socket.on('radar:scan', (coords, ack) => {
      const helpers = Array.from(onlineHelpers.values()).filter((h) => h.isAvailable);
      ack?.({ helpers, count: helpers.length });
    });

    // ── Join Booking Room for Live Tracking ────────────────────────────
    socket.on('booking:join', (bookingId) => {
      socket.join(`booking:${bookingId}`);
      logger.debug(`Socket ${socket.id} (user ${userId}) joined tracking room booking:${bookingId}`);
    });

    socket.on('booking:leave', (bookingId) => {
      socket.leave(`booking:${bookingId}`);
    });

    // ── Join conversation room ─────────────────────────────────────────
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.debug('Socket joined conversation', {
        userId,
        conversationId,
      });
    });

    // ── Leave conversation room ────────────────────────────────────────
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ── Send message ───────────────────────────────────────────────────
    socket.on('message:send', async (data, ack) => {
      try {
        const { conversationId, content, messageType, mediaUrl } = data;

        if (!conversationId || !content?.trim()) {
          return ack?.({ error: 'Conversation ID and content are required' });
        }

        const message = await chatService.sendMessage(
          conversationId,
          userId,
          content.trim(),
          { messageType, mediaUrl }
        );

        // Broadcast to all participants in the conversation room
        io.to(`conversation:${conversationId}`).emit('message:new', message);

        ack?.({ success: true, message });
      } catch (error) {
        logger.error('Socket message send failed', {
          userId,
          error: error.message,
        });
        ack?.({ error: error.message || 'Failed to send message' });
      }
    });

    // ── Mark messages as read ──────────────────────────────────────────
    socket.on('messages:read', async (data, ack) => {
      try {
        const { conversationId } = data;
        if (!conversationId) {
          return ack?.({ error: 'Conversation ID is required' });
        }

        const result = await chatService.markMessagesAsRead(conversationId, userId);

        io.to(`conversation:${conversationId}`).emit('messages:read-status', {
          conversationId,
          readBy: userId,
          modifiedCount: result.modifiedCount,
        });

        ack?.({ success: true, ...result });
      } catch (error) {
        ack?.({ error: error.message });
      }
    });

    // ── Typing indicator ───────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    // ── Disconnect ─────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      userSockets.get(userId)?.delete(socket.id);
      if (userSockets.get(userId)?.size === 0) {
        userSockets.delete(userId);
      }
      socketUsers.delete(socket.id);

      // If helper disconnected from all sockets, mark offline
      if (userRole === 'helper' && !userSockets.has(userId)) {
        onlineHelpers.delete(userId);
        io.emit('helper:nearby_update', Array.from(onlineHelpers.values()));
      }

      logger.info('Socket disconnected', {
        userId,
        socketId: socket.id,
        reason,
      });
    });
  });

  logger.info('Socket.IO server initialized with Radar & Tracking');

  return { io, sendToUser, userSockets };
}

// ── Exported Real-Time Dispatch Functions ───────────────────────────────────

/**
 * Broadcast newly posted task to all online helpers in radar
 */
export function broadcastNewTask(task) {
  if (!ioInstance) return;
  ioInstance.to('role:helper').emit('task:available:new', task);
  ioInstance.emit('task:radar_ping', {
    taskId: task._id || task.id,
    category: task.category,
    price: task.price,
    location: task.location,
  });
  logger.info('Broadcasted new task to helpers', { taskId: task._id || task.id });
}

/**
 * Notify customer and booking room that a helper accepted or updated the booking
 */
export function notifyBookingUpdate(bookingId, customerId, booking) {
  if (!ioInstance) return;
  // Send to customer private room
  if (customerId) {
    ioInstance.to(`user:${customerId}`).emit('booking:status_change', booking);
  }
  // Send to tracking room
  ioInstance.to(`booking:${bookingId}`).emit('booking:status_change', booking);
  logger.info('Notified booking update', { bookingId, status: booking.status });
}

export const sendToUser = (targetUserId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user:${targetUserId}`).emit(event, data);
  }
};

export function getOnlineHelpersMap() {
  return onlineHelpers;
}

export default initSocketServer;

