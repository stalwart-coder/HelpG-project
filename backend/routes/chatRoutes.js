import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { body, param, query } from 'express-validator';
import {
  getMyConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from '../controllers/chatController.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// ── Validation rules ──────────────────────────────────────────────────────
const conversationRules = [
  body('userId')
    .notEmpty()
    .withMessage('Recipient user ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),

  body('bookingId')
    .optional({ values: 'falsy' })
    .isMongoId()
    .withMessage('Invalid booking ID'),
];

const sendMessageRules = [
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be 1-2000 characters'),

  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'location'])
    .withMessage('Invalid message type'),

  body('mediaUrl')
    .optional()
    .isString()
    .withMessage('Invalid media URL'),
];

const conversationIdParam = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
];

// ── Routes ────────────────────────────────────────────────────────────────
router.get('/conversations', getMyConversations);
router.post('/conversations', conversationRules, validate, getOrCreateConversation);
router.get('/unread-count', getUnreadCount);
router.get('/conversations/:conversationId/messages', conversationIdParam, validate, getMessages);
router.post('/conversations/:conversationId/messages', [...conversationIdParam, ...sendMessageRules], validate, sendMessage);
router.patch('/conversations/:conversationId/read', conversationIdParam, validate, markAsRead);

export default router;
