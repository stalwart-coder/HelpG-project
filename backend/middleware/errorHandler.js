import env from '../config/env.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * Converts non-ApiError exceptions into ApiError instances.
 * Handles Mongoose, JWT, Multer errors, etc.
 */
export function errorConverter(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      (error.name === 'CastError' ? 400 : 0) ||
      (error.code === 11000 ? 409 : 0) ||
      (error.name === 'ValidationError' ? 400 : 0) ||
      (error.name === 'UnauthorizedError' ? 401 : 0) ||
      (error.name === 'JsonWebTokenError' ? 401 : 0) ||
      (error.name === 'TokenExpiredError' ? 401 : 0) ||
      500;

    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
}

/**
 * Global error response middleware.
 * Sends structured JSON with stack trace in development only.
 */
export function errorHandler(err, req, res, _next) {
  let { statusCode, message } = err;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for: ${field}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join('; ');
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File size exceeds the allowed limit';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  logger.error('Error response', {
    statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
    ...(env.isDev && { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDev && { stack: err.stack }),
    data: null,
  });
}
