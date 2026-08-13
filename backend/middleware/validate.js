import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Express-validator middleware that checks validation results
 * and returns the first error encountered.
 * Usage: Pass after validation rules in the route definition.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const message = firstError.msg;
    throw new ApiError(400, message);
  }
  next();
};

export default validate;
