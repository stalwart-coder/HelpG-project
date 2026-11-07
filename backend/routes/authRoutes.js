import { Router } from 'express';
import validate from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  signupRules,
  loginRules,
  sendOtpRules,
  verifyOtpRules,
  forgotPasswordRules,
  resetPasswordRules,
} from '../validations/authValidation.js';
import * as authController from '../controllers/authController.js';

const router = Router();

// ── Firebase Google Sign-In (verify Firebase ID token → create/login user) ──
router.post('/firebase-google', authLimiter, authController.firebaseGoogle);

// ── Sensitive routes protected by authLimiter ──────────────────────────────
router.post('/signup', authLimiter, signupRules, validate, authController.signup);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/send-otp', authLimiter, sendOtpRules, validate, authController.sendOtp);
router.post('/verify-otp', authLimiter, verifyOtpRules, validate, authController.verifyOtp);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, validate, authController.resetPassword);

// ── Token refresh (handled by globalLimiter, exempt from strict authLimiter) ───
router.post('/refresh-token', authController.refreshToken);

// ── Protected routes (require authentication) ──────────────────────────────
router.post('/logout', authenticate, authController.logout);

export default router;


