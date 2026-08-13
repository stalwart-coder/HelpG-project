import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Get or create a conversation between two users.
 * If a bookingId is provided, looks for an existing booking-specific conversation.
 *
 * @param {string} userId - Current user ID
 * @param {string} otherUserId - Other participant ID
 * @param {string} [bookingId] - Optional booking ID
 * @returns {Promise<Object>} Conversation document
 */
export async function getOrCreateConversation(userId, otherUserId, bookingId = null) {
  let query = {
    participants: { $all: [userId, otherUserId] },
    isActive: true,
  };

  // If booking-specific, try to find existing
  if (bookingId) {
    query = {
      ...query,
      bookingId,
    };
    const existing = await Conversation.findOne(query)
      .populate('participants', 'name avatar role');
    if (existing) return existing;
  }

  // General conversation (no booking)
  const existing = await Conversation.findOne(query)
    .populate('participants', 'name avatar role');
  if (existing) return existing;

  // Create new conversation
  const conversation = await Conversation.create({
    participants: [userId, otherUserId],
    bookingId: bookingId || null,
  });

  logger.info('Conversation created', {
    conversationId: conversation._id,
    participants: [userId, otherUserId],
    bookingId,
  });

  return conversation.populate('participants', 'name avatar role');
}

/**
 * Send a message in a conversation.
 *
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender user ID
 * @param {string} content - Message text content
 * @param {Object} [options] - { messageType, mediaUrl }
 * @returns {Promise<Object>} Created message
 */
export async function sendMessage(conversationId, senderId, content, options = {}) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Verify sender is a participant
  const isParticipant = conversation.participants.some(
    (p) => p.toString() === senderId
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this conversation');
  }

  if (!conversation.isActive) {
    throw new ApiError(400, 'This conversation is no longer active');
  }

  // Save message to database
  const message = await Message.create({
    conversationId,
    senderId,
    content,
    messageType: options.messageType || 'text',
    mediaUrl: options.mediaUrl || '',
  });

  // Update conversation's lastMessage
  conversation.lastMessage = {
    content,
    senderId,
    sentAt: message.createdAt,
  };
  await conversation.save();

  return message.populate('senderId', 'name avatar role');
}

/**
 * Get messages for a conversation (paginated, newest first).
 *
 * @param {string} conversationId
 * @param {string} userId - For authorization check
 * @param {Object} query - { limit, skip, before (date) }
 * @returns {Promise<Object>} { messages, total, hasMore }
 */
export async function getMessages(conversationId, userId, query = {}) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  // Verify user is a participant
  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You do not have access to this conversation');
  }

  const limit = Math.min(parseInt(query.limit, 10) || 50, 100);
  const filter = {
    conversationId,
    isDeleted: false,
  };

  // Support cursor-based pagination using date
  if (query.before) {
    filter.createdAt = { $lt: new Date(query.before) };
  }

  const messages = await Message.find(filter)
    .populate('senderId', 'name avatar role')
    .sort({ createdAt: -1 })
    .limit(limit + 1) // Fetch one extra to check hasMore
    .lean();

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return {
    messages: messages.reverse(), // Return in chronological order
    total: await Message.countDocuments({ conversationId, isDeleted: false }),
    hasMore,
  };
}

/**
 * Get all conversations for a user.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUserConversations(userId) {
  const conversations = await Conversation.find({
    participants: userId,
    isActive: true,
  })
    .populate('participants', 'name avatar role phone')
    .populate('bookingId', 'title status category price')
    .sort({ updatedAt: -1 })
    .lean();

  // Attach unread count for each conversation
  const result = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: userId },
        isRead: false,
      });

      return {
        ...conv,
        unreadCount,
      };
    })
  );

  return result;
}

/**
 * Mark messages as read in a conversation.
 *
 * @param {string} conversationId
 * @param {string} userId - Reader's user ID
 * @returns {Promise<Object>} { modifiedCount }
 */
export async function markMessagesAsRead(conversationId, userId) {
  const result = await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  return { modifiedCount: result.modifiedCount };
}

/**
 * Get unread message count across all conversations for a user.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function getTotalUnreadCount(userId) {
  const conversations = await Conversation.find({
    participants: userId,
    isActive: true,
  }).select('_id');

  const conversationIds = conversations.map((c) => c._id);

  if (conversationIds.length === 0) return 0;

  return Message.countDocuments({
    conversationId: { $in: conversationIds },
    senderId: { $ne: userId },
    isRead: false,
  });
}

export default {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  getUserConversations,
  markMessagesAsRead,
  getTotalUnreadCount,
};
