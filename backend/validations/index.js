import { body, query, param } from 'express-validator';

export const commonRules = {
  paginate: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isString()
      .withMessage('Sort must be a string'),
  ],

  mongoId: (field = 'id') =>
    param(field).isMongoId().withMessage(`Invalid ${field}`),

  phone: body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Invalid phone number'),

  email: body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  password: body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  name: body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
};

export default commonRules;
