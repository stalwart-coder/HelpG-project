import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

/**
 * Generate access token for a given user or admin.
 * @param {Object} user - Mongoose user/admin document
 * @param {string} [type='user'] - Token type ('user' or 'admin')
 * @returns {string} Signed JWT access token
 */
export function generateAccessToken(user, type = 'user') {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    phone: user.phone,
    role: user.role,
    type,
  };

  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

/**
 * Generate refresh token for a given user.
 * @param {Object} user - Mongoose user document
 * @returns {string} Signed JWT refresh token
 */
export function generateRefreshToken(user) {
  const payload = {
    id: user._id.toString(),
  };

  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

/**
 * Verify an access token and return decoded payload.
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 * @throws {ApiError} If token is invalid or expired
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.accessSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    }
    throw new ApiError(401, 'Invalid access token');
  }
}

/**
 * Verify a refresh token and return decoded payload.
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {ApiError} If token is invalid or expired
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.jwt.refreshSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Refresh token expired');
    }
    throw new ApiError(401, 'Invalid refresh token');
  }
}

/**
 * Generate both access and refresh tokens.
 * @param {Object} user - Mongoose user document
 * @param {string} [type='user'] - Token type
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateAuthTokens(user, type = 'user') {
  return {
    accessToken: generateAccessToken(user, type),
    refreshToken: generateRefreshToken(user),
  };
}
