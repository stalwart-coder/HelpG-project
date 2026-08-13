import { verifyAccessToken } from '../services/tokenService.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware to authenticate requests via JWT access token.
 * Expects the token in the Authorization header as `Bearer <token>`.
 * Also accepts token from cookie `accessToken` as fallback.
 *
 * On success, attaches `req.user` with user document (without password/refreshToken).
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  let token = null;

  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Fallback to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. No token provided.');
  }

  const decoded = verifyAccessToken(token);

  // CRITICAL: Reject admin tokens on user-facing APIs
  // Admin tokens must only be used via /api/admin/* endpoints (authenticateAdmin middleware)
  if (decoded.type === 'admin') {
    throw new ApiError(401, 'Invalid user token. Admin tokens cannot access user APIs.');
  }

  const user = await User.findById(decoded.id).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists.');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account has been deactivated. Please contact support.');
  }

  req.user = user;
  next();
});

/**
 * Middleware to restrict access based on user roles.
 * Must be used after `authenticate` middleware.
 *
 * @param  {...string} roles - Allowed roles (e.g., 'customer', 'helper', 'admin')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }

    next();
  };
};

export { authenticate, authorize };
export default authenticate;
