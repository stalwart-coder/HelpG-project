import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating a Razorpay order.
 */
export const createOrderRules = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),
];

/**
 * Validation rules for verifying a Razorpay payment.
 */
export const verifyPaymentRules = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required')
    .isString()
    .withMessage('Razorpay order ID must be a string'),

  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required')
    .isString()
    .withMessage('Razorpay payment ID must be a string'),

  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
    .isString()
    .withMessage('Razorpay signature must be a string'),

  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),
];

/**
 * Validation rules for payment failure.
 */
export const paymentFailureRules = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required')
    .isString()
    .withMessage('Razorpay order ID must be a string'),

  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('error')
    .optional()
    .isObject()
    .withMessage('Error must be an object'),
];

/**
 * Validation rules for refund.
 */
export const refundRules = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .trim()
    .isLength({ min: 2, max: 500 })
    .withMessage('Reason must be 2-500 characters'),
];

/**
 * Validation rules for getting payment by ID.
 */
export const getPaymentRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid payment/transaction ID'),
];

export default {
  createOrderRules,
  verifyPaymentRules,
  paymentFailureRules,
  refundRules,
  getPaymentRules,
};

