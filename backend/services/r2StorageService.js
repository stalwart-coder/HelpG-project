/**
 * Cloudflare R2 Storage Service
 * R2 is S3-compatible, so we use @aws-sdk/client-s3
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME
 *   R2_PUBLIC_URL  (e.g. https://pub-xxxx.r2.dev or your custom domain)
 */
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import env from '../config/env.js';

// ── R2 Client Initialization ──────────────────────────────────────────────────
let r2Client = null;

function getR2Client() {
  if (r2Client) return r2Client;

  if (!env.cloudflare.accountId || !env.cloudflare.r2AccessKeyId || !env.cloudflare.r2SecretAccessKey) {
    logger.warn('Cloudflare R2 credentials not configured — file uploads will use local disk fallback');
    return null;
  }

  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.cloudflare.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.cloudflare.r2AccessKeyId,
      secretAccessKey: env.cloudflare.r2SecretAccessKey,
    },
  });

  return r2Client;
}

// ── Upload File Buffer to R2 ──────────────────────────────────────────────────
/**
 * @param {Buffer} fileBuffer - file data
 * @param {string} originalName - original filename
 * @param {string} mimeType - MIME type (e.g. 'image/jpeg')
 * @param {string} folder - subfolder in bucket (e.g. 'kyc', 'profiles', 'bookings')
 * @returns {Promise<{ url: string, key: string }>}
 */
export async function uploadToR2(fileBuffer, originalName, mimeType, folder = 'uploads') {
  const client = getR2Client();

  if (!client) {
    // Local fallback — return a placeholder URL (dev only)
    logger.warn(`R2 not configured. File "${originalName}" was NOT uploaded to cloud.`);
    return { url: null, key: null, local: true };
  }

  const ext = path.extname(originalName).toLowerCase();
  const key = `${folder}/${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.cloudflare.r2BucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    // Make publicly readable if using R2 public bucket
    // ACL: 'public-read', // Only if bucket has public access enabled
  });

  await client.send(command);

  // Construct public URL from R2 public domain
  const publicUrl = `${env.cloudflare.r2PublicUrl}/${key}`;

  logger.info(`Uploaded to R2: ${key} → ${publicUrl}`);
  return { url: publicUrl, key };
}

// ── Delete File from R2 ───────────────────────────────────────────────────────
export async function deleteFromR2(key) {
  const client = getR2Client();
  if (!client || !key) return;

  try {
    await client.send(new DeleteObjectCommand({
      Bucket: env.cloudflare.r2BucketName,
      Key: key,
    }));
    logger.info(`Deleted from R2: ${key}`);
  } catch (err) {
    logger.error(`Failed to delete from R2: ${key}`, { error: err.message });
  }
}

// ── Generate Pre-signed URL for Private Downloads ─────────────────────────────
export async function getPresignedDownloadUrl(key, expiresInSeconds = 3600) {
  const client = getR2Client();
  if (!client || !key) return null;

  const command = new HeadObjectCommand({
    Bucket: env.cloudflare.r2BucketName,
    Key: key,
  });

  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return url;
}

// ── Check if R2 is configured and available ───────────────────────────────────
export function isR2Configured() {
  return !!(env.cloudflare.accountId && env.cloudflare.r2AccessKeyId && env.cloudflare.r2SecretAccessKey);
}
