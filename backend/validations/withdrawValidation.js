import { body } from 'express-validator';

/**
 * Validation rules for withdrawal requests.
 */
export const withdrawRules = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least ₹1'),

  body('upiId')
    .notEmpty()
    .withMessage('UPI ID or phone number is required')
    .trim()
    .isLength({ min: 6, max: 50 })
    .withMessage('UPI ID must be 6-50 characters'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters'),
];

export default { withdrawRules };
