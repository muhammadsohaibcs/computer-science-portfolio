/**
 * crypto.util.js
 *
 * Comprehensive cryptographic utilities for hashing, encryption, and secure comparisons
 */

const crypto = require('crypto');
const securityConfig = require('../config/security.config');

/**
 * Hash token with HMAC
 */
function hashToken(token, secret) {
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a, b) {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

/**
 * Generate encryption key from password
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(
    password,
    salt,
    100000, // iterations
    securityConfig.encryption.keyLength,
    'sha256'
  );
}

/**
 * Encrypt sensitive data (AES-256-GCM)
 * @param {string} text - Plain text to encrypt
 * @param {string} masterKey - Master encryption key (from env)
 * @returns {string} - Encrypted data with IV and auth tag (format: iv:authTag:encrypted)
 */
function encrypt(text, masterKey = process.env.ENCRYPTION_KEY) {
  if (!masterKey) {
    throw new Error('Encryption key not configured');
  }
  
  try {
    // Generate random IV
    const iv = crypto.randomBytes(securityConfig.encryption.ivLength);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      securityConfig.encryption.algorithm,
      Buffer.from(masterKey, 'hex'),
      iv
    );
    
    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt sensitive data (AES-256-GCM)
 * @param {string} encryptedData - Encrypted data (format: iv:authTag:encrypted)
 * @param {string} masterKey - Master encryption key (from env)
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedData, masterKey = process.env.ENCRYPTION_KEY) {
  if (!masterKey) {
    throw new Error('Encryption key not configured');
  }
  
  try {
    // Parse encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      securityConfig.encryption.algorithm,
      Buffer.from(masterKey, 'hex'),
      iv
    );
    
    // Set auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Generate random token
 */
function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate OTP (One-Time Password)
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

/**
 * Hash password with salt (for additional security beyond Argon2)
 */
function hashWithSalt(data, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  
  const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify hashed data
 */
function verifyHash(data, hash, salt) {
  const { hash: newHash } = hashWithSalt(data, salt);
  return timingSafeEqual(hash, newHash);
}

/**
 * Generate secure random string
 */
function generateSecureRandom(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

module.exports = {
  hashToken,
  timingSafeEqual,
  deriveKey,
  encrypt,
  decrypt,
  generateRandomToken,
  generateOTP,
  hashWithSalt,
  verifyHash,
  generateSecureRandom
};