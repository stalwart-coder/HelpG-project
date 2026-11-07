import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/helpji',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  logLevel: process.env.LOG_LEVEL || 'debug',

  upload: {
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
  },

  // ── Cloudflare R2 Object Storage ───────────────────────────────────────────
  // R2 is S3-compatible — configure with your R2 API token credentials
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    r2BucketName: process.env.R2_BUCKET_NAME || 'helpji-files',
    // Public URL for your R2 bucket (enable public access in Cloudflare dashboard)
    // e.g. https://pub-abc123.r2.dev or your custom domain like https://files.helpji.app
    r2PublicUrl: process.env.R2_PUBLIC_URL || '',
  },

  // ── Firebase Admin SDK ─────────────────────────────────────────────────────
  // Download service account JSON from Firebase Console → Project Settings → Service accounts
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    // Paste private_key from service account JSON. In .env use \n for newlines.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  // ── Google Maps ────────────────────────────────────────────────────────────
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },

  // ── Razorpay ──────────────────────────────────────────────────────────────
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_test_secret',
  },

  // ── Platform Commission ───────────────────────────────────────────────────
  payment: {
    platformCommissionPercent: parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) || 0.10,
  },

  // ── Email (nodemailer) ────────────────────────────────────────────────────
  email: {
    from: process.env.EMAIL_FROM || 'noreply@helpji.app',
    smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
  },

  // ── Twilio (SMS OTP) ──────────────────────────────────────────────────────
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  // ── Push Notifications (FCM) ──────────────────────────────────────────────
  notification: {
    fcmServerKey: process.env.FCM_SERVER_KEY || '',
    fcmProjectId: process.env.FCM_PROJECT_ID || '',
  },

  // ── AI Module ─────────────────────────────────────────────────────────────
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },

  // ── Demo Seeding ───────────────────────────────────────────────────────────
  // Set SEED_DEMO_DATA=false in production .env to disable seeding demo accounts
  seed: {
    enabled: process.env.SEED_DEMO_DATA !== 'false',
  },
};

export default env;
