/**
 * twofa.service.js
 *
 * TOTP-based Two-Factor Authentication service.
 * Uses the `otplib` library for RFC 6238 compliant TOTP.
 *
 * Install: npm install otplib qrcode
 */

const logger = require('../utils/logger');

// Lazy-require so app boots even if libs not installed yet
let authenticator, qrcode;
try {
  ({ authenticator } = require('otplib'));
  qrcode = require('qrcode');
} catch (e) {
  logger.warn('otplib/qrcode not installed. Run: npm install otplib qrcode');
}

const UsersRepo = require('../repositories/users.repo');

const APP_NAME = process.env.APP_NAME || 'MediCore HMS';

class TwoFAService {
  /** Generate a new TOTP secret + QR code for a user */
  async generateSecret(userId, username) {
    if (!authenticator) throw new Error('2FA library not installed. Run: npm install otplib qrcode');

    const secret = authenticator.generateSecret(20); // 160-bit secret
    const otpAuthUrl = authenticator.keyuri(username, APP_NAME, secret);
    const qrDataUrl = await qrcode.toDataURL(otpAuthUrl);

    // Temporarily store unverified secret (user must confirm before activating)
    await UsersRepo.setTwoFAPendingSecret(userId, secret);

    logger.info({ userId }, '2FA setup initiated');
    return { secret, qrDataUrl, otpAuthUrl };
  }

  /** Confirm TOTP code and activate 2FA */
  async enableTwoFA(userId, totpCode) {
    if (!authenticator) throw new Error('2FA library not installed');

    const user = await UsersRepo.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.twoFactorPendingSecret) throw new Error('No pending 2FA setup. Call generateSecret first.');

    const isValid = authenticator.verify({ token: totpCode, secret: user.twoFactorPendingSecret });
    if (!isValid) throw new Error('Invalid TOTP code. Please check your authenticator app.');

    await UsersRepo.activateTwoFA(userId, user.twoFactorPendingSecret);
    logger.info({ userId }, '2FA enabled');
    return { message: '2FA enabled successfully' };
  }

  /** Disable 2FA after verifying the current TOTP code */
  async disableTwoFA(userId, totpCode) {
    if (!authenticator) throw new Error('2FA library not installed');

    const user = await UsersRepo.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.twoFactorEnabled || !user.twoFactorSecret) throw new Error('2FA is not currently enabled');

    const isValid = authenticator.verify({ token: totpCode, secret: user.twoFactorSecret });
    if (!isValid) throw new Error('Invalid TOTP code. Please check your authenticator app.');

    await UsersRepo.deactivateTwoFA(userId);
    logger.info({ userId }, '2FA disabled');
    return { message: '2FA disabled successfully' };
  }

  /** Verify a TOTP code during login */
  async verifyCode(userId, totpCode) {
    if (!authenticator) throw new Error('2FA library not installed');

    const user = await UsersRepo.findById(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) throw new Error('2FA is not enabled for this account');

    const isValid = authenticator.verify({ token: totpCode, secret: user.twoFactorSecret });
    if (!isValid) throw new Error('Invalid or expired 2FA code');

    return true;
  }

  /** Get 2FA status for a user */
  async getStatus(userId) {
    const user = await UsersRepo.findById(userId);
    if (!user) throw new Error('User not found');
    return {
      twoFactorEnabled: !!user.twoFactorEnabled,
      email: user.email,
    };
  }
}

module.exports = new TwoFAService();
