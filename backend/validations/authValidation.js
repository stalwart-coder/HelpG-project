import { body } from 'express-validator';

/**
 * Validation rules for user signup.
 */
export const signupRules = [
  body('name')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Invalid phone number format'),

  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['customer', 'helper'])
    .withMessage('Role must be either customer or helper'),
];

/**
 * Validation rules for login.
 */
export const loginRules = [
  body('emailOrPhone')
    .custom((val, { req }) => {
      const value = val || req.body.email || req.body.phone;
      if (!value) {
        throw new Error('Email or phone number is required');
      }
      req.body.emailOrPhone = value;
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for sending OTP.
 */
export const sendOtpRules = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Invalid phone number format'),

  body('purpose')
    .notEmpty()
    .withMessage('OTP purpose is required')
    .isIn(['signup', 'login', 'password-reset', 'phone-verification'])
    .withMessage('Invalid OTP purpose'),
];

/**
 * Validation rules for verifying OTP.
 */
export const verifyOtpRules = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Invalid phone number format'),

  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must be numeric'),
];

/**
 * Validation rules for forgot password (send reset OTP).
 */
export const forgotPasswordRules = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Invalid phone number format'),
];

/**
 * Validation rules for reset password.
 */
export const resetPasswordRules = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Invalid phone number format'),

  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must be numeric'),

  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

