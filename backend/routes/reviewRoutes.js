import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

// All review routes require authentication
router.use(authenticate);

// POST /api/reviews — create a review
router.post(
  '/',
  [
    body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment must not exceed 1000 characters'),
    body('tags').optional().isArray(),
    body('photos').optional().isArray(),
  ],
  validate,
  reviewController.createReview
);

// GET /api/reviews/my — get my submitted reviews
router.get('/my', reviewController.getMyReviews);

// GET /api/reviews/booking/:bookingId — get review for a booking
router.get(
  '/booking/:bookingId',
  [param('bookingId').isMongoId().withMessage('Valid booking ID is required')],
  validate,
  reviewController.getBookingReview
);

// GET /api/reviews/helper/:helperId — public helper reviews
router.get(
  '/helper/:helperId',
  [param('helperId').isMongoId().withMessage('Valid helper ID is required')],
  validate,
  reviewController.getHelperReviews
);

// PATCH /api/reviews/:reviewId/respond — helper responds to a review
router.patch(
  '/:reviewId/respond',
  [
    param('reviewId').isMongoId().withMessage('Valid review ID is required'),
    body('response')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Response is required')
      .isLength({ max: 500 })
      .withMessage('Response must not exceed 500 characters'),
  ],
  validate,
  reviewController.respondToReview
);

export default router;
