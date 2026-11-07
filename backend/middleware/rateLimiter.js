import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

/**
 * Rate limiters for different routes:
 * - `globalLimiter`: Applied to all routes (100 req / 15 min by default)
 * - `authLimiter`: Stricter limiter for auth endpoints (5 req / 15 min)
 * - `adminLimiter`: Stricter limiter for admin login (5 req / 15 min)
 */

const isTest = process.env.NODE_ENV === 'test';

/**
 * Global rate limiter — 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: isTest ? 10000 : env.rateLimit.max,
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'Too many requests. Please try again later.'));
  },
});

/**
 * Rate limiter for sensitive auth endpoints (login, signup, OTP).
 * Allows 20 attempts per 15 minutes per IP.
 * Crucially, successful logins are skipped so genuine users are never blocked.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 20,
  skipSuccessfulRequests: true,
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'Too many login attempts. Please wait 15 minutes or reset your password.'));
  },
});

/**
 * Strict rate limiter for admin login — 15 attempts per 15 minutes per IP.
 * Skips successful requests.
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 15,
  skipSuccessfulRequests: true,
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'Too many admin login attempts. Please try again later.'));
  },
});

export { globalLimiter, authLimiter, adminLimiter };
export default globalLimiter;
