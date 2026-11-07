/**
 * Upload Routes — handles file uploads to Cloudflare R2 (or local disk fallback)
 *
 * POST /api/upload          → single or multiple files
 * POST /api/upload/profile  → profile photo (resizes to square)
 * POST /api/upload/kyc      → KYC documents
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadFileToR2 } from '../middleware/upload.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// ── Generic file upload (any field name) ─────────────────────────────────────
router.post(
  '/',
  upload.any(),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, 'No file uploaded');
    }

    const uploaded = await Promise.all(
      req.files.map(async (file) => {
        // Determine folder from fieldname
        const folder = ['avatar', 'profile', 'photo'].includes(file.fieldname)
          ? 'profiles'
          : ['aadhaar', 'pan', 'license', 'kyc', 'document'].includes(file.fieldname)
          ? 'kyc'
          : 'uploads';

        const { url, key, isLocal } = await uploadFileToR2(file, folder);
        return {
          fieldName: file.fieldname,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url,
          key,
          storage: isLocal ? 'local' : 'r2',
        };
      })
    );

    if (uploaded.length === 1) {
      return ApiResponse.created(res, {
        url: uploaded[0].url,
        key: uploaded[0].key,
        fieldName: uploaded[0].fieldName,
        file: uploaded[0],
      }, 'File uploaded successfully');
    }

    return ApiResponse.created(res, {
      files: uploaded,
      urls: uploaded.map((f) => f.url),
    }, 'Files uploaded successfully');
  })
);

// ── Profile photo upload ──────────────────────────────────────────────────────
router.post(
  '/profile',
  upload.single('avatar'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No profile photo uploaded');
    const { url, key } = await uploadFileToR2(req.file, 'profiles');
    return ApiResponse.ok(res, { url, key }, 'Profile photo uploaded successfully');
  })
);

// ── KYC document upload ───────────────────────────────────────────────────────
router.post(
  '/kyc',
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'license', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new ApiError(400, 'No KYC documents uploaded');
    }

    const results = {};
    for (const [fieldName, files] of Object.entries(req.files)) {
      const file = files[0];
      const { url, key } = await uploadFileToR2(file, 'kyc');
      results[fieldName] = { url, key };
    }

    return ApiResponse.ok(res, results, 'KYC documents uploaded successfully');
  })
);

export default router;
