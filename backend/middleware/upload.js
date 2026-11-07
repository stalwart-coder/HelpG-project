/**
 * Upload middleware — streams files to Cloudflare R2 (if configured)
 * Falls back to local disk storage when R2 credentials are missing (dev mode)
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import { uploadToR2, isR2Configured } from '../services/r2StorageService.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '..', env.upload.uploadDir);

// Ensure local upload directory exists (used for dev fallback)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/webm',
];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WEBP, HEIC, PDF, DOC, DOCX, MP4, WEBM`), false);
  }
};

// Use memoryStorage so we can stream the buffer directly to R2
const storage = multer.memoryStorage();

// Local disk fallback for development
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  },
});

// Choose storage strategy based on R2 availability
const chosenStorage = isR2Configured() ? storage : diskStorage;

if (isR2Configured()) {
  logger.info('📦 File uploads: Cloudflare R2 storage active');
} else {
  logger.warn('📁 File uploads: Local disk storage (R2 not configured — set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL in .env)');
}

export const upload = multer({
  storage: chosenStorage,
  limits: {
    fileSize: (env.upload.maxFileSizeMB || 10) * 1024 * 1024,
  },
  fileFilter,
});

/**
 * After multer processes the file(s), call this to upload buffer to R2.
 * Returns the public URL.
 *
 * @param {Express.Multer.File} file - multer file object
 * @param {string} folder - R2 folder prefix (e.g. 'kyc', 'profiles')
 * @returns {Promise<{ url: string, key: string }>}
 */
export async function uploadFileToR2(file, folder = 'uploads') {
  if (!isR2Configured()) {
    // Local disk fallback — file is already saved by diskStorage
    const baseUrl = env.isProd ? env.cors.frontendUrl : 'http://localhost:5000';
    return {
      url: `${baseUrl}/uploads/${file.filename}`,
      key: `local/${file.filename}`,
      isLocal: true,
    };
  }

  // file.buffer is available because we use memoryStorage
  return uploadToR2(file.buffer, file.originalname, file.mimetype, folder);
}

export default upload;
