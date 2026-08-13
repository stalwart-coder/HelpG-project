import { body, param, query } from 'express-validator';
import { DAYS_OF_WEEK } from '../models/Availability.js';

/**
 * Validation rules for helper profile update.
 */
export const updateProfileRules = [
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO date'),

  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street must not exceed 200 characters'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),

  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),

  body('address.pincode')
    .optional()
    .trim()
    .matches(/^\d{5,6}$/)
    .withMessage('Pincode must be 5-6 digits'),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((val) => {
      if (val[0] < -180 || val[0] > 180 || val[1] < -90 || val[1] > 90) {
        throw new Error('Invalid coordinates range');
      }
      return true;
    }),

  body('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Skills must be a non-empty array'),

  body('skills.*.categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('skills.*.experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be 0-50 years'),

  body('experienceYears')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be 0-50'),

  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),

  body('languages.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each language must be 1-50 characters'),
];

/**
 * Validation rules for availability toggle.
 */
export const toggleAvailabilityRules = [
  body('isAvailable')
    .notEmpty()
    .withMessage('isAvailable is required')
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
];

/**
 * Validation rules for schedule update.
 */
export const updateScheduleRules = [
  body('schedule')
    .notEmpty()
    .withMessage('Schedule is required')
    .isArray({ min: 1 })
    .withMessage('Schedule must be a non-empty array'),

  body('schedule.*.dayOfWeek')
    .notEmpty()
    .withMessage('Day of week is required')
    .isIn(DAYS_OF_WEEK)
    .withMessage(`Day must be one of: ${DAYS_OF_WEEK.join(', ')}`),

  body('schedule.*.startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:mm format'),

  body('schedule.*.endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:mm format'),

  body('schedule.*.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('timezone')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Timezone is required'),
];

/**
 * Validation rules for adding a service area.
 */
export const addServiceAreaRules = [
  body('name')
    .notEmpty()
    .withMessage('Area name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Area name must be 2-100 characters'),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isObject()
    .withMessage('Location must be an object'),

  body('location.type')
    .optional()
    .isIn(['Point'])
    .withMessage('Location type must be Point'),

  body('location.coordinates')
    .notEmpty()
    .withMessage('Coordinates are required')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]')
    .custom((val) => {
      if (val[0] < -180 || val[0] > 180 || val[1] < -90 || val[1] > 90) {
        throw new Error('Invalid coordinates range');
      }
      return true;
    }),

  body('radiusKm')
    .notEmpty()
    .withMessage('Radius is required')
    .isFloat({ min: 1, max: 50 })
    .withMessage('Radius must be between 1 and 50 km'),
];

/**
 * Validation rules for accepting/rejecting a booking.
 */
export const acceptRejectBookingRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters'),
];

/**
 * Validation rules for updating booking task status (start/arrived/complete).
 */
export const updateTaskStatusRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters'),
];

export default {
  updateProfileRules,
  toggleAvailabilityRules,
  updateScheduleRules,
  addServiceAreaRules,
  acceptRejectBookingRules,
  updateTaskStatusRules,
};

