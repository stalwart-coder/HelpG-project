import * as chatService from '../services/chatService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * GET /api/chat/conversations
 * Get all conversations for the current user.
 */
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await chatService.getUserConversations(req.user._id);
  return new ApiResponse(200, conversations, 'Conversations retrieved successfully').send(res);
});

/**
 * POST /api/chat/conversations
 * Get or create a conversation with another user.
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId: otherUserId, bookingId } = req.body;
  const conversation = await chatService.getOrCreateConversation(
    req.user._id,
    otherUserId,
    bookingId || null
  );
  return new ApiResponse(200, conversation, 'Conversation retrieved successfully').send(res);
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Get messages for a conversation.
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages = await chatService.getMessages(conversationId, req.user._id, req.query);
  return new ApiResponse(200, messages, 'Messages retrieved successfully').send(res);
});

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Send a message (REST fallback; prefer Socket.IO for real-time).
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, messageType, mediaUrl } = req.body;

  const message = await chatService.sendMessage(conversationId, req.user._id, content, {
    messageType,
    mediaUrl,
  });

  return new ApiResponse(201, message, 'Message sent successfully').send(res);
});

/**
 * PATCH /api/chat/conversations/:conversationId/read
 * Mark messages as read in a conversation.
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const result = await chatService.markMessagesAsRead(conversationId, req.user._id);
  return new ApiResponse(200, result, 'Messages marked as read').send(res);
});

/**
 * GET /api/chat/unread-count
 * Get total unread message count.
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await chatService.getTotalUnreadCount(req.user._id);
  return new ApiResponse(200, { count }, 'Unread count retrieved').send(res);
});
