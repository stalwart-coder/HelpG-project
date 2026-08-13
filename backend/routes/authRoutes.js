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

// ── All auth routes use the strict rate limiter ─────────────────────────
router.use(authLimiter);

// ── Public routes ───────────────────────────────────────────────────────
router.post('/signup', signupRules, validate, authController.signup);
router.post('/login', loginRules, validate, authController.login);
router.post('/send-otp', sendOtpRules, validate, authController.sendOtp);
router.post('/verify-otp', verifyOtpRules, validate, authController.verifyOtp);
router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// ── Protected routes (require authentication) ──────────────────────────
router.post('/logout', authenticate, authController.logout);

export default router;

