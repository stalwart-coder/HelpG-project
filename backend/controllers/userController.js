/**
 * User Controller — Profile management for customers and helpers
 */
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

/**
 * GET /api/users/profile
 * Get the authenticated user's own profile.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken');
  if (!user) throw new ApiError(404, 'User not found');
  return new ApiResponse(200, user, 'Profile retrieved').send(res);
});

/**
 * PATCH /api/users/profile
 * Update the authenticated user's own profile.
 * Allowed fields: name, email, location, avatar
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const ALLOWED = ['name', 'email', 'location', 'avatar'];
  const updates = {};
  for (const key of ALLOWED) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update.');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) throw new ApiError(404, 'User not found');

  return new ApiResponse(200, user, 'Profile updated').send(res);
});

/**
 * DELETE /api/users/profile
 * Deactivate (soft-delete) the authenticated user's account.
 */
export const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  res.clearCookie('refreshToken');
  return new ApiResponse(200, null, 'Account deactivated. We are sorry to see you go.').send(res);
});
