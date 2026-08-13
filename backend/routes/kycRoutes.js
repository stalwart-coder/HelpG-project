import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { submitKycRules, updateBankRules, updateUpiRules, kycIdParam } from '../validations/kycValidation.js';
import * as kycController from '../controllers/kycController.js';

const router = Router();

// All KYC routes require authentication
router.use(authenticate);

// ── Helper routes ──────────────────────────────────────────────────────
router.get('/status', authorize('helper'), kycController.getKycStatus);
router.post('/submit', authorize('helper'), submitKycRules, validate, kycController.submitKyc);
router.post('/resubmit', authorize('helper'), submitKycRules, validate, kycController.resubmitKyc);
router.put('/bank-details', authorize('helper'), updateBankRules, validate, kycController.updateBankDetails);
router.put('/upi', authorize('helper'), updateUpiRules, validate, kycController.updateUpi);

// ── Admin routes (backend only) ────────────────────────────────────────
router.post('/approve/:id', authorize('admin'), kycIdParam, validate, kycController.approveKyc);
router.post('/reject/:id', authorize('admin'), kycIdParam, validate, kycController.rejectKyc);
router.get('/all', authorize('admin'), kycController.listKyc);

export default router;
