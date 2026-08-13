/**
 * Email Service
 *
 * Production-ready email sending using nodemailer.
 * Configure via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 *
 * In development, emails are logged to console.
 */
import logger from '../utils/logger.js';
import env from '../config/env.js';

let transporter = null;

// Lazy-load nodemailer only when needed
async function getTransporter() {
  if (transporter) return transporter;

  if (env.isProd) {
    const nodemailer = (await import('nodemailer')).default;
    transporter = nodemailer.createTransport({
      host: env.email.smtpHost,
      port: env.email.smtpPort,
      secure: env.email.smtpPort === 465,
      auth: {
        user: env.email.smtpUser,
        pass: env.email.smtpPass,
      },
    });
  } else {
    // In dev, use a mock transporter
    transporter = {
      sendMail: async (options) => {
        logger.info('[DEV EMAIL]', {
          to: options.to,
          subject: options.subject,
          text: options.text?.substring(0, 200),
        });
        return { messageId: `dev-${Date.now()}` };
      },
    };
  }

  return transporter;
}

/**
 * Send an email.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @returns {Promise<Object>}
 */
export async function sendEmail({ to, subject, text = '', html = '' }) {
  const t = await getTransporter();

  const mailOptions = {
    from: env.email.from,
    to,
    subject,
    ...(text && { text }),
    ...(html && { html }),
  };

  const info = await t.sendMail(mailOptions);

  logger.info('Email sent', {
    to,
    subject,
    messageId: info.messageId,
  });

  return info;
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(to, resetLink) {
  return sendEmail({
    to,
    subject: 'HelpJi - Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}

/**
 * Send a booking confirmation email.
 */
export async function sendBookingConfirmationEmail(to, bookingDetails) {
  return sendEmail({
    to,
    subject: 'HelpJi - Booking Confirmed',
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Your booking #${bookingDetails.id} has been confirmed.</p>
      <p><strong>Service:</strong> ${bookingDetails.title}</p>
      <p><strong>Scheduled:</strong> ${bookingDetails.scheduledAt}</p>
      <p><strong>Amount:</strong> ₹${bookingDetails.totalAmount}</p>
    `,
  });
}

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
};
