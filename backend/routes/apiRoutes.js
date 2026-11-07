import { Router } from 'express';
import healthRoutes from './healthRoutes.js';

const router = Router();

// ── Health check ─────────────────────────────────────────────────────────
router.use('/health', healthRoutes);

// ── Auth module ─────────────────────────────────────────────────────────
import authRoutes from './authRoutes.js';
router.use('/auth', authRoutes);

// ── User module ──────────────────────────────────────────────────────────
import userRoutes from './userRoutes.js';
router.use('/users', userRoutes);

// ── Booking module ──────────────────────────────────────────────────────
import bookingRoutes from './bookingRoutes.js';
router.use('/bookings', bookingRoutes);

// ── Helper module ───────────────────────────────────────────────────────
import helperRoutes from './helperRoutes.js';
router.use('/helpers', helperRoutes);

// ── KYC module ──────────────────────────────────────────────────────────
import kycRoutes from './kycRoutes.js';
router.use('/kyc', kycRoutes);

// ── Chat module ──────────────────────────────────────────────────────────
import chatRoutes from './chatRoutes.js';
router.use('/chat', chatRoutes);

// ── Payment module ───────────────────────────────────────────────────────
import paymentRoutes from './paymentRoutes.js';
router.use('/payments', paymentRoutes);

// ── Notifications module ─────────────────────────────────────────────────
import notificationRoutes from './notificationRoutes.js';
router.use('/notifications', notificationRoutes);

// ── Reviews module ───────────────────────────────────────────────────────
import reviewRoutes from './reviewRoutes.js';
router.use('/reviews', reviewRoutes);

// ── Support module ───────────────────────────────────────────────────────
import supportRoutes from './supportRoutes.js';
router.use('/support', supportRoutes);

// ── AI Module ────────────────────────────────────────────────────────────────
import aiRoutes from '../ai/routes/aiRoutes.js';
router.use('/ai', aiRoutes);

// ── Upload module ────────────────────────────────────────────────────────
import uploadRoutes from './uploadRoutes.js';
router.use('/upload', uploadRoutes);

// ── Enterprise Admin Module ──────────────────────────────────────────────
import adminRoutes from './adminRoutes.js';
router.use('/admin', adminRoutes);

export default router;
