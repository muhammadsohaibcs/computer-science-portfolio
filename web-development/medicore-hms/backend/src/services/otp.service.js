/**
 * otp.service.js
 *
 * Generates and validates 6-digit numeric OTPs for:
 *  - Password change verification
 *  - Any future email-gated action
 *
 * OTPs are stored in-memory (Redis-backed when available) with a 10-minute TTL.
 * In production swap the in-memory store for Redis using the existing redis client.
 */

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/** In-memory fallback store: Map<userId, { otp, expiresAt }> */
const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Build nodemailer transporter from environment */
function createTransporter() {
  // Support SendGrid, SMTP, Ethereal etc. via env vars
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // SendGrid shortcut
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
    });
  }
  // Dev fallback: Ethereal (logs preview URL to console)
  return null;
}

class OtpService {
  /** Generate and send OTP email. Returns the generated OTP (for testing). */
  async sendOtp(userId, email) {
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(userId, { otp, expiresAt: Date.now() + OTP_TTL_MS });

    logger.info({ userId }, `OTP generated for password change request`);

    const transporter = createTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@medicore-hms.com',
          to: email,
          subject: 'MediCore HMS — Password Change OTP',
          html: `
            <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
              <div style="background: #2579e8; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">MediCore HMS</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Hospital Management System</p>
              </div>
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 8px;">Password Change Request</h2>
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Use the OTP below to verify your identity and change your password.
                This code expires in <strong>10 minutes</strong>.
              </p>
              <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
                <div style="font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #2579e8; font-family: 'JetBrains Mono', monospace;">${otp}</div>
              </div>
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                If you did not request this, please ignore this email and your password will remain unchanged.
                Never share this code with anyone.
              </p>
            </div>
          `,
          text: `Your MediCore HMS OTP for password change is: ${otp}\nExpires in 10 minutes.\nNever share this code.`,
        });
        logger.info({ userId, email }, 'OTP email sent');
      } catch (emailErr) {
        logger.error({ err: emailErr }, 'Failed to send OTP email');
        // Don't throw — still return OTP for dev logging
      }
    } else {
      // Dev mode: log to console when no email provider configured
      logger.warn({ otp }, '⚠️  No email provider configured — OTP printed to console (DEV ONLY)');
      console.log('\n🔑 [DEV OTP]', otp, '(expires in 10 min)\n');
    }

    return otp; // return for unit testing; do NOT expose to client
  }

  /** Verify an OTP. Returns true on success, throws on failure. */
  verify(userId, submittedOtp) {
    const record = otpStore.get(userId);
    if (!record) throw new Error('OTP not found or already used. Please request a new one.');
    if (Date.now() > record.expiresAt) {
      otpStore.delete(userId);
      throw new Error('OTP has expired. Please request a new one.');
    }
    if (record.otp !== submittedOtp.trim()) throw new Error('Invalid OTP. Please check and try again.');
    otpStore.delete(userId); // one-time use
    return true;
  }

  /** Clear OTP for a user (e.g., on logout) */
  clear(userId) {
    otpStore.delete(userId);
  }
}

module.exports = new OtpService();
