import { body, param } from 'express-validator';
import { BOOKING_STATUSES } from '../models/Booking.js';

/**
 * Validation rules for booking endpoints.
 */
export const createBookingRules = [
  body('category')
    .notEmpty()
    .withMessage('Service category is required')
    .trim()
    .isIn(['iron', 'vehicle', 'guard', 'event'])
    .withMessage('Invalid service category'),

  body('title')
    .notEmpty()
    .withMessage('Booking title is required')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be 3-200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be 3-200 characters'),

  body('scheduledAt')
    .notEmpty()
    .withMessage('Scheduled date/time is required')
    .isISO8601()
    .withMessage('Scheduled time must be a valid ISO date')
    .custom((value) => {
      const date = new Date(value);
      if (date <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    }),

  body('duration')
    .optional()
    .isIn(['onetime', '1day', '2day'])
    .withMessage('Duration must be onetime, 1day, or 2day'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),

  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a non-negative number'),
];

export const getBookingRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),
];

export const updateStatusRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(BOOKING_STATUSES)
    .withMessage(`Status must be one of: ${BOOKING_STATUSES.join(', ')}`),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters'),
];

export const cancelBookingRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Reason must be 2-200 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

export const rescheduleBookingRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('newScheduledAt')
    .notEmpty()
    .withMessage('New scheduled date/time is required')
    .isISO8601()
    .withMessage('New time must be a valid ISO date')
    .custom((value) => {
      const date = new Date(value);
      if (date <= new Date()) {
        throw new Error('New scheduled time must be in the future');
      }
      return true;
    }),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),
];

export default {
  createBookingRules,
  getBookingRules,
  updateStatusRules,
  cancelBookingRules,
  rescheduleBookingRules,
};

