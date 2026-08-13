import { body, param, query } from 'express-validator';
import { ADMIN_ROLES } from '../models/Admin.js';

export const loginRules = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const createAdminRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .optional()
    .isIn(ADMIN_ROLES)
    .withMessage(`Role must be one of: ${ADMIN_ROLES.join(', ')}`),
];

export const enforceAdminRoleRules = [
  body('role')
    .optional()
    .isIn(ADMIN_ROLES)
    .withMessage(`Invalid role. Allowed: ${ADMIN_ROLES.join(', ')}`),
];

export const toggleUserStatusRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('isActive')
    .notEmpty()
    .withMessage('isActive is required')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),
];

export const deleteUserRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),
];

export const suspendHelperRules = [
  param('id').isMongoId().withMessage('Invalid helper ID'),
  body('reason')
    .notEmpty()
    .withMessage('Suspension reason is required')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be 3-500 characters'),
];

export const approveHelperRules = [
  param('id').isMongoId().withMessage('Invalid helper ID'),
];

export const rejectKycRules = [
  param('id').isMongoId().withMessage('Invalid KYC ID'),
  body('reason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be 3-500 characters'),
];

export const approveKycRules = [
  param('id').isMongoId().withMessage('Invalid KYC ID'),
];

export const cancelBookingRules = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be 3-500 characters'),
];

export const reassignBookingRules = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('helperId')
    .notEmpty()
    .withMessage('New helper ID is required')
    .isMongoId()
    .withMessage('Invalid helper ID'),
];

export const processRefundRules = [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be 3-500 characters'),
];

export const createCouponRules = [
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Code must be 3-20 characters'),
  body('discountType')
    .notEmpty()
    .withMessage('Discount type is required')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .notEmpty()
    .withMessage('Discount value is required')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be non-negative'),
  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max discount must be non-negative'),
  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min order amount must be non-negative'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiry must be a valid ISO date'),
];

export const updateCouponRules = [
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Code must be 3-20 characters'),
  body('discountValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be non-negative'),
  body('status')
    .optional()
    .isIn(['active', 'disabled'])
    .withMessage('Status must be active or disabled'),
];

export const ticketActionRules = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note must not exceed 1000 characters'),
];

export const assignTicketRules = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
  body('adminId')
    .notEmpty()
    .withMessage('Admin ID is required')
    .isMongoId()
    .withMessage('Invalid admin ID'),
];

export const resolveTicketRules = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
  body('resolution')
    .notEmpty()
    .withMessage('Resolution is required')
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage('Resolution must be 3-2000 characters'),
];

export const commonPaginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim(),
  query('status')
    .optional()
    .trim(),
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
];

export default {
  loginRules,
  createAdminRules,
  enforceAdminRoleRules,
  toggleUserStatusRules,
  deleteUserRules,
  suspendHelperRules,
  approveHelperRules,
  rejectKycRules,
  approveKycRules,
  cancelBookingRules,
  reassignBookingRules,
  processRefundRules,
  createCouponRules,
  updateCouponRules,
  ticketActionRules,
  assignTicketRules,
  resolveTicketRules,
  commonPaginationRules,
};
