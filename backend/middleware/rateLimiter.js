import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

/**
 * Rate limiters for different routes:
 * - `globalLimiter`: Applied to all routes (100 req / 15 min by default)
 * - `authLimiter`: Stricter limiter for auth endpoints (5 req / 15 min)
 * - `adminLimiter`: Stricter limiter for admin login (5 req / 15 min)
 */

/**
 * Global rate limiter — 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'Too many requests. Please try again later.'));
  },
});

/**
 * Strict rate limiter for auth endpoints — 5 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'Too many auth attempts. Please try again later.'));
  },
});

/**
 * Strict rate limiter for admin login — 5 requests per 15 minutes per IP.
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'Too many admin login attempts. Please try again later.'));
  },
});

export { globalLimiter, authLimiter, adminLimiter };
export default globalLimiter;
