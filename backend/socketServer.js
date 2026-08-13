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

/**
 * Initialize Socket.IO with the HTTP server.
 */
export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.cors.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

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

    // Track user connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socketUsers.set(socket.id, userId);

    logger.info('Socket connected', {
      userId,
      socketId: socket.id,
      activeConnections: userSockets.get(userId).size,
    });

    // Join a personal room for direct messaging
    socket.join(`user:${userId}`);

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

        // Also notify the conversation participants directly
        const conversation = await chatService.getOrCreateConversation(
          userId,
          userId // Just to get conversation data
        );

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

        // Notify the conversation that messages were read
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

      logger.info('Socket disconnected', {
        userId,
        socketId: socket.id,
        reason,
      });
    });
  });

  // ── Helper to send event to a specific user ────────────────────────────
  const sendToUser = (targetUserId, event, data) => {
    io.to(`user:${targetUserId}`).emit(event, data);
  };

  logger.info('Socket.IO server initialized');

  return { io, sendToUser, userSockets };
}

export default initSocketServer;
