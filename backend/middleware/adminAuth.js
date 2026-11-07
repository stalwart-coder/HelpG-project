import { verifyAccessToken } from '../services/tokenService.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware to authenticate admin requests.
 * Only accepts tokens with type === 'admin'.
 * Expects the token in the Authorization header as `Bearer <token>`.
 *
 * On success, attaches `req.admin` with admin user document.
 */
const authenticateAdmin = asyncHandler(async (req, _res, next) => {
  let token = null;

  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Fallback to cookie
  if (!token && req.cookies?.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token) {
    throw new ApiError(401, 'Admin authentication required. No token provided.');
  }

  const decoded = verifyAccessToken(token);

  // CRITICAL: Only admin-type tokens can access admin APIs
  if (decoded.type !== 'admin') {
    throw new ApiError(401, 'Invalid admin token. Regular user tokens cannot access admin APIs.');
  }

  let admin = await Admin.findById(decoded.id).select('-password -refreshToken');
  if (!admin) {
    // Fallback: check if stored in User collection with admin role
    admin = await User.findById(decoded.id).select('-password -refreshToken');
  }

  if (!admin) {
    throw new ApiError(401, 'Admin account no longer exists.');
  }

  if (!admin.isActive) {
    throw new ApiError(401, 'Admin account has been deactivated.');
  }

  const allowedRoles = ['admin', 'super_admin', 'moderator'];
  if (!allowedRoles.includes(admin.role)) {
    throw new ApiError(403, 'User is not an authorized administrator.');
  }

  req.admin = admin;
  req.user = admin; // Also set req.user for compatibility with user-facing middleware
  next();
});

/**
 * Middleware to restrict access based on user roles.
 * Must be used after `authenticateAdmin` or `authenticate` middleware.
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'customer')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      // This should have been caught by authenticate/authenticateAdmin
      throw new ApiError(401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }

    next();
  };
};

/**
 * Middleware to authorize admins.
 * Must be used after `authenticateAdmin`.
 */
const authorizeAdmin = authorize('admin');

/**
 * @deprecated Use `authorize` instead.
 */
const authorizePermission = authorize;

export { authenticateAdmin, authorize, authorizeAdmin, authorizePermission };
export default authenticateAdmin;
