import { verifyAccessToken } from '../services/tokenService.js';
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

  const admin = await User.findById(decoded.id).select('-password -refreshToken');
  if (!admin) {
    throw new ApiError(401, 'Admin account no longer exists.');
  }

  if (!admin.isActive) {
    throw new ApiError(401, 'Admin account has been deactivated.');
  }

  if (admin.role !== 'admin') {
    throw new ApiError(403, 'User is not an admin.');
  }

  req.admin = admin;
  req.user = admin; // Also set req.user for compatibility with user-facing middleware
  next();
});

export { authenticateAdmin };
export default authenticateAdmin;
