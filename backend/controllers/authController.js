import * as authService from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * POST /api/auth/signup
 * Create a new user account.
 */
const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return new ApiResponse(201, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Account created successfully').send(res);
});

/**
 * POST /api/auth/login
 * Authenticate user and return tokens.
 */
const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const result = await authService.login(emailOrPhone, password);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return new ApiResponse(200, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Login successful').send(res);
});

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number.
 */
const sendOtp = asyncHandler(async (req, res) => {
  const { phone, purpose } = req.body;
  const result = await authService.sendOtp(phone, purpose);
  return new ApiResponse(200, result, 'OTP sent successfully').send(res);
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP code. If purpose was 'login', also logs the user in.
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  
  // Try phone login first (handles login OTP flow)
  try {
    const result = await authService.phoneLogin(phone, otp);
    
    // If user exists, set refresh token cookie
    if (!result.isNew && result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: req.secure,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return new ApiResponse(200, {
      user: result.user,
      accessToken: result.accessToken,
      isNew: result.isNew,
    }, 'OTP verified successfully').send(res);
  } catch {
    // If not a login OTP, fallback to regular verify
    const result = await authService.verifyOtp(phone, otp);
    return new ApiResponse(200, result, 'OTP verified successfully').send(res);
  }
});

/**
 * POST /api/auth/forgot-password
 * Send OTP for password reset.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const result = await authService.forgotPassword(phone);
  return new ApiResponse(200, result, 'Reset code sent successfully').send(res);
});

/**
 * POST /api/auth/reset-password
 * Reset password with OTP verification.
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { phone, otp, password } = req.body;
  const result = await authService.resetPassword(phone, otp, password);
  return new ApiResponse(200, result, 'Password reset successful').send(res);
});

/**
 * POST /api/auth/refresh-token
 * Get new access token using refresh token.
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const tokens = await authService.refreshAuthToken(token);

  // Update the HTTP-only cookie with new refresh token
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return new ApiResponse(200, {
    accessToken: tokens.accessToken,
  }, 'Token refreshed successfully').send(res);
});

/**
 * POST /api/auth/logout
 * Invalidate refresh token.
 */
const logout = asyncHandler(async (req, res) => {
  // req.user is set by auth middleware
  if (req.user?._id) {
    await authService.logout(req.user._id);
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'strict',
  });

  return new ApiResponse(200, null, 'Logged out successfully').send(res);
});

export {
  signup,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
};

