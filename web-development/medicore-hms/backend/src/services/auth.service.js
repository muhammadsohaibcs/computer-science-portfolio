/**
 * auth.service.js
 *
 * Responsibilities:
 * - Register / login / logout
 * - Token generation & rotation
 * - Secure refresh token storage
 *
 * Lab references:
 * - Token rotation & security best practices: /mnt/data/3. ADB Lab Manual CSC316 ADB.pdf
 */

const argon2 = require('argon2');
const mongoose = require('mongoose');
const UsersRepo = require('../repositories/users.repo');
const { genRefresh, hashToken, signAccess } = require('../utils/generate-tokens');
const config = require('../config/app.config');
const logger = require('../utils/logger');

class AuthService {
  async register({ username, password, role, profileRef = null }) {
    const existing = await UsersRepo.findByUsername(username);
    if (existing) throw new Error('Username already exists');

    const passwordHash = await argon2.hash(password);
    const user = await UsersRepo.create({ username, passwordHash, role, profileRef });
    logger.info({ userId: user._id }, 'User registered');
    return user;
  }

  async login({ username, password, ip = null, device = null }) {
    const user = await UsersRepo.findByUsername(username);
    if (!user) throw new Error('Invalid credentials');

    // Check if passwordHash exists
    if (!user.passwordHash || typeof user.passwordHash !== 'string') {
      logger.error({ userId: user._id }, 'User has invalid passwordHash');
      throw new Error('Invalid credentials');
    }

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new Error('Invalid credentials');

    const accessToken = signAccess({ sub: user._id, role: user.role, username: user.username });
    const refreshPlain = genRefresh();
    const refreshHash = hashToken(refreshPlain, config.jwt.refreshSecret);
    const expiresAt = new Date(Date.now() + config.jwt.refreshExpiryDays * 24 * 3600 * 1000);

    await UsersRepo.addRefreshToken(user._id, refreshHash, expiresAt, device, ip);
    logger.info({ userId: user._id }, 'User logged in');
    return { 
      accessToken, 
      refreshToken: refreshPlain, 
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    };
  }

  async rotateRefreshToken(plainRefresh) {
    const incomingHash = hashToken(plainRefresh, config.jwt.refreshSecret);
    const user = await UsersRepo.findByRefreshHash(incomingHash);
    if (!user) throw new Error('Invalid refresh token');

    // transaction: remove old token, add new hashed token
    const { withOptionalTransaction } = require('../utils/transaction-helper');
    
    await withOptionalTransaction(async (session) => {
      await UsersRepo.removeRefreshToken(incomingHash, session);
      const newPlain = genRefresh();
      const newHash = hashToken(newPlain, config.jwt.refreshSecret);
      const expiresAt = new Date(Date.now() + config.jwt.refreshExpiryDays * 24 * 3600 * 1000);
      await UsersRepo.addRefreshToken(user._id, newHash, expiresAt, null, null, session);
    });
    
    const accessToken = signAccess({ sub: user._id, role: user.role, username: user.username });
    return { accessToken, refreshToken: 'rotated' }; // return rotated token via separate channel in real app
  }

  async logout(plainRefresh) {
    const hash = hashToken(plainRefresh, config.jwt.refreshSecret);
    await UsersRepo.removeRefreshToken(hash);
    return { ok: true };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await UsersRepo.findById(userId);
    if (!user) throw new Error('User not found');

    // Verify current password
    if (!user.passwordHash || typeof user.passwordHash !== 'string') {
      logger.error({ userId: user._id }, 'User has invalid passwordHash');
      throw new Error('Invalid current password');
    }

    const isValid = await argon2.verify(user.passwordHash, currentPassword);
    if (!isValid) throw new Error('Invalid current password');

    // Ensure new password is different from current
    const isSame = await argon2.verify(user.passwordHash, newPassword);
    if (isSame) throw new Error('New password must be different from current password');

    // Hash and update new password
    const newPasswordHash = await argon2.hash(newPassword);
    await UsersRepo.updatePassword(userId, newPasswordHash);
    
    logger.info({ userId }, 'Password changed successfully');
    return { success: true };
  }
}

module.exports = new AuthService();
