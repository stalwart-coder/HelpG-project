import { Router } from 'express';
import healthRoutes from './healthRoutes.js';

const router = Router();

// ── Health check ─────────────────────────────────────────────────────────
router.use('/health', healthRoutes);

// ── Auth module ─────────────────────────────────────────────────────────
import authRoutes from './authRoutes.js';
router.use('/auth', authRoutes);

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

// ── Enterprise Admin Module ──────────────────────────────────────────────
import adminRoutes from './adminRoutes.js';
router.use('/admin', adminRoutes);

export default router;
