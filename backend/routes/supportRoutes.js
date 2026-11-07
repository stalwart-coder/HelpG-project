import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import * as supportController from '../controllers/supportController.js';

const router = Router();

// All support routes require authentication
router.use(authenticate);

// POST /api/support/tickets — create a new ticket
router.post(
  '/tickets',
  [
    body('subject')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 200 })
      .withMessage('Subject must not exceed 200 characters'),
    body('description')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters'),
    body('category').optional().isString(),
    body('bookingId').optional().isMongoId().withMessage('Valid booking ID is required'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
  ],
  validate,
  supportController.createTicket
);

// GET /api/support/tickets — list user's tickets
router.get('/tickets', supportController.getMyTickets);

// GET /api/support/tickets/:ticketId — get a single ticket
router.get(
  '/tickets/:ticketId',
  [param('ticketId').isMongoId().withMessage('Valid ticket ID is required')],
  validate,
  supportController.getTicketById
);

// POST /api/support/tickets/:ticketId/reply — add reply
router.post(
  '/tickets/:ticketId/reply',
  [
    param('ticketId').isMongoId().withMessage('Valid ticket ID is required'),
    body('content')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Reply content is required')
      .isLength({ max: 1000 })
      .withMessage('Reply must not exceed 1000 characters'),
  ],
  validate,
  supportController.replyToTicket
);

// PATCH /api/support/tickets/:ticketId/close — user closes ticket
router.patch(
  '/tickets/:ticketId/close',
  [param('ticketId').isMongoId().withMessage('Valid ticket ID is required')],
  validate,
  supportController.closeTicket
);

export default router;
