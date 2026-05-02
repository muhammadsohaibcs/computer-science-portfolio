/**
 * generate-tokens.js
 *
 * Helpers to sign access tokens, generate refresh tokens and hash them.
 * - Access tokens: short lived JWT signed with accessSecret
 * - Refresh tokens: random secure string hashed before storing (use crypto.util.hash)
 *
 * WARNING: Keep secrets in environment (.env) and rotate keys regularly.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { hashToken: hashUtil } = require('./crypto.util');
const config = require('../config/app.config');

function genRefresh(len = 64) {
  return crypto.randomBytes(Math.ceil(len/2)).toString('hex');
}

function signAccess(payload, expiresIn = config.jwt.accessExpiry || '15m') {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn });
}

function verifyAccess(token) {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    throw err;
  }
}

function hashToken(token, secret = config.jwt.refreshSecret) {
  // HMAC-SHA256 using refresh secret before storing
  return hashUtil(token, secret);
}

module.exports = { genRefresh, signAccess, verifyAccess, hashToken };