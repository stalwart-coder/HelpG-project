/**
 * SMS / OTP Service
 *
 * Production-ready SMS sending using Twilio.
 * Configure via environment variables:
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 *
 * In development, OTPs are logged to console.
 */
import logger from '../utils/logger.js';
import env from '../config/env.js';

let twilioClient = null;

async function getClient() {
  if (twilioClient) return twilioClient;

  if (env.isProd) {
    const twilio = (await import('twilio')).default;
    twilioClient = twilio(env.twilio.accountSid, env.twilio.authToken);
  } else {
    // Mock client for development
    twilioClient = {
      messages: {
        create: async (options) => {
          logger.info('[DEV SMS]', {
            to: options.to,
            body: options.body?.substring(0, 100),
          });
          return { sid: `SM-dev-${Date.now()}`, status: 'sent' };
        },
      },
    };
  }

  return twilioClient;
}

/**
 * Send an SMS message.
 *
 * @param {string} to - Recipient phone number (E.164 format)
 * @param {string} body - Message body
 * @returns {Promise<Object>}
 */
export async function sendSms(to, body) {
  const client = await getClient();

  const message = await client.messages.create({
    body,
    to,
    from: env.twilio.phoneNumber,
  });

  logger.info('SMS sent', {
    to,
    sid: message.sid,
    status: message.status,
  });

  return message;
}

/**
 * Send an OTP via SMS.
 *
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 * @param {string} [purpose] - Purpose description
 * @returns {Promise<Object>}
 */
export async function sendOtpSms(phone, otp, purpose = 'verification') {
  const body = `Your HelpJi ${purpose} OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;

  if (env.isDev) {
    logger.info(`[DEV OTP] To ${phone}: ${otp} (purpose: ${purpose})`);
    // In dev, just log — no SMS cost
    return { sid: `dev-${Date.now()}`, status: 'logged' };
  }

  return sendSms(phone, body);
}

export default {
  sendSms,
  sendOtpSms,
};
