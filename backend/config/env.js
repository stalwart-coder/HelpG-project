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
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  },

  // ── Razorpay ──────────────────────────────────────────────────────────────
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_test_secret',
  },

  // ── Payment / Commission ──────────────────────────────────────────────────
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

  // ── Twilio (SMS) ──────────────────────────────────────────────────────────
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
};

export default env;
