import crypto from 'crypto';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { generateAuthTokens, verifyRefreshToken } from './tokenService.js';
import { verifyFirebaseToken } from './firebaseAdmin.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

// ── Constants ─────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure random OTP.
 * @param {number} length - OTP digit length
 * @returns {string} OTP string
 */
function generateOtp(length = OTP_LENGTH) {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
}

/**
 * Create a new user account.
 * @param {Object} data - { name, phone, email, password, role }
 * @returns {Object} { user, accessToken, refreshToken }
 */
export async function signup(data) {
  const { name, phone, email, password, role } = data;

  // Check if user already exists with phone
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new ApiError(409, 'An account with this phone number already exists.');
  }

  // Check if email is already taken (if provided)
  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new ApiError(409, 'An account with this email address already exists.');
    }
  }

  const user = await User.create({
    name,
    phone,
    ...(email && { email }),
    password,
    role: role || 'customer',
    isPhoneVerified: true, // phone verified via OTP before signup
  });

  const tokens = generateAuthTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user: user.toJSON(),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * Authenticate user with email/phone and password.
 * @param {string} emailOrPhone
 * @param {string} password
 * @returns {Object} { user, accessToken, refreshToken }
 */
export async function login(emailOrPhone, password) {
  if (!emailOrPhone || !password) {
    throw new ApiError(400, 'Email/phone and password are required.');
  }

  // Find user by email or phone
  const isEmail = emailOrPhone.includes('@');
  const query = isEmail
    ? { email: emailOrPhone.toLowerCase().trim() }
    : { phone: emailOrPhone.trim() };

  const user = await User.findOne(query).select('+password +refreshToken');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials. Please check your email/phone and password.');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account has been deactivated. Please contact support.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials. Please check your email/phone and password.');
  }

  const tokens = generateAuthTokens(user);
  user.refreshToken = tokens.refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    user: user.toJSON(),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * Send OTP to the given phone number.
 * In production, this would integrate with an SMS gateway.
 * For development, OTP is returned in the response for testing.
 *
 * @param {string} phone
 * @param {string} purpose - 'signup' | 'login' | 'password-reset' | 'phone-verification'
 * @returns {Object} { message, otp (dev only) }
 */
export async function sendOtp(phone, purpose) {
  // Invalidate any previous unused OTPs for this phone + purpose
  await Otp.updateMany(
    { phone, purpose, isUsed: false },
    { isUsed: true }
  );

  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.create({
    phone,
    purpose,
    otp: otpCode,
    expiresAt,
  });

  // In production, send OTP via SMS gateway (never log OTP in production)
  if (env.isDev || process.env.NODE_ENV === 'test') {
    logger.debug(`[OTP] To ${phone}: ${otpCode} (purpose: ${purpose})`);
  }

  const response = { message: 'OTP sent successfully' };

  // In development/test mode, return OTP for testing
  if (env.isDev || process.env.NODE_ENV === 'test') {
    response.otp = otpCode;
  }

  return response;
}

/**
 * Verify OTP for a given phone number and purpose.
 * @param {string} phone
 * @param {string} otpCode
 * @returns {Object} { valid: boolean }
 */
export async function verifyOtp(phone, otpCode) {
  const otpDoc = await Otp.findOne({
    phone,
    otp: otpCode,
    isUsed: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new ApiError(400, 'Invalid OTP. Please request a new one.');
  }

  if (otpDoc.isExpired()) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (otpDoc.attempts >= MAX_OTP_ATTEMPTS) {
    throw new ApiError(400, 'Too many invalid attempts. Please request a new OTP.');
  }

  // Mark OTP as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  return { valid: true, purpose: otpDoc.purpose };
}

/**
 * Login or signup via phone OTP verification.
 * If user exists, logs them in. If not, returns a signal for signup.
 * @param {string} phone
 * @param {string} otpCode
 * @returns {Object} { user, accessToken, refreshToken, isNew }
 */
export async function phoneLogin(phone, otpCode) {
  // Verify OTP first
  const otpDoc = await Otp.findOne({
    phone,
    otp: otpCode,
    isUsed: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new ApiError(400, 'Invalid OTP. Please request a new one.');
  }

  if (otpDoc.isExpired()) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (otpDoc.purpose !== 'login') {
    throw new ApiError(400, 'This OTP was not requested for login.');
  }

  // Mark OTP as used (anti-replay)
  otpDoc.isUsed = true;
  await otpDoc.save();

  // Check if user exists
  const user = await User.findOne({ phone });
  if (user) {
    if (!user.isActive) {
      throw new ApiError(401, 'Account has been deactivated. Please contact support.');
    }

    // Log the user in
    const tokens = generateAuthTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNew: false,
    };
  }

  // New user — signal to continue signup
  return { user: null, accessToken: null, refreshToken: null, isNew: true };
}

/**
 * Initiate forgot password flow — sends OTP to user's phone.
 * @param {string} phone
 * @returns {Object} { message, otp (dev only) }
 */
export async function forgotPassword(phone) {
  const user = await User.findOne({ phone });
  if (!user) {
    throw new ApiError(404, 'No account found with this phone number.');
  }

  return sendOtp(phone, 'password-reset');
}

/**
 * Reset password using OTP verification.
 * @param {string} phone
 * @param {string} otpCode
 * @param {string} newPassword
 * @returns {Object} { message }
 */
export async function resetPassword(phone, otpCode, newPassword) {
  // Verify OTP
  const otpDoc = await Otp.findOne({
    phone,
    otp: otpCode,
    purpose: 'password-reset',
    isUsed: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new ApiError(400, 'Invalid OTP. Please request a new one.');
  }

  if (otpDoc.isExpired()) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  // Mark OTP as used (anti-replay)
  otpDoc.isUsed = true;
  await otpDoc.save();

  const user = await User.findOne({ phone }).select('+password');
  if (!user) {
    throw new ApiError(404, 'No account found with this phone number.');
  }

  user.password = newPassword;
  user.refreshToken = undefined; // Invalidate all sessions
  await user.save();

  return { message: 'Password reset successful.' };
}

/**
 * Refresh access token using refresh token.
 * @param {string} refreshToken
 * @returns {Object} { accessToken, refreshToken }
 */
export async function refreshAuthToken(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required.');
  }

  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists.');
  }

  // Compare stored refresh token with provided one
  if (user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Refresh token is invalid or has been revoked.');
  }

  const tokens = generateAuthTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return tokens;
}

/**
 * Logout user by clearing refresh token.
 * @param {string} userId
 */
export async function logout(userId) {
  await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: '' } },
    { new: true }
  );
}

/**
 * Handle Firebase Google Sign-In / Sign-Up
 * Verifies ID token, looks up or creates user account, returns HelpJi JWT session
 * @param {string} idToken - Firebase Google Auth ID Token
 * @param {string} role - 'customer' or 'helper'
 * @returns {Object} { user, accessToken, refreshToken }
 */
export async function firebaseGoogleLogin(idToken, role = 'customer') {
  if (!idToken) {
    throw new ApiError(400, 'Firebase ID token is required');
  }

  let decoded;
  try {
    decoded = await verifyFirebaseToken(idToken);
  } catch (err) {
    logger.error('Firebase token verification error', { error: err.message });
    throw new ApiError(401, `Invalid Firebase token: ${err.message}`);
  }

  const { uid, email, name, picture } = decoded;

  // Search by firebaseUid or matching email
  let user = await User.findOne({
    $or: [
      { firebaseUid: uid },
      ...(email ? [{ email }] : []),
    ],
  });

  if (!user) {
    const assignedRole = ['customer', 'helper'].includes(role) ? role : 'customer';
    user = new User({
      name: name || (email ? email.split('@')[0] : 'HelpJi User'),
      email: email || undefined,
      googleEmail: email || undefined,
      firebaseUid: uid,
      authProvider: 'google',
      avatar: picture || '',
      role: assignedRole,
      isEmailVerified: Boolean(email),
      isActive: true,
    });
    await user.save();
  } else {
    let modified = false;
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      modified = true;
    }
    if (picture && !user.avatar) {
      user.avatar = picture;
      modified = true;
    }
    if (email && !user.googleEmail) {
      user.googleEmail = email;
      modified = true;
    }
    if (modified) {
      await user.save({ validateBeforeSave: false });
    }
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account has been deactivated. Please contact support.');
  }

  const tokens = generateAuthTokens(user);
  user.refreshToken = tokens.refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    user: user.toJSON(),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}


