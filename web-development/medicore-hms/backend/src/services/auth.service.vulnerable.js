/**
 * auth.service.vulnerable.js
 * 
 * ⚠️ EDUCATIONAL PURPOSE ONLY - DO NOT USE IN PRODUCTION ⚠️
 * 
 * This file demonstrates a VULNERABLE authentication implementation
 * that is susceptible to NoSQL injection attacks.
 * 
 * This is intentionally insecure to demonstrate the vulnerability.
 */

const User = require('../models/user.model');
const { signAccess, genRefresh, hashToken } = require('../utils/generate-tokens');
const config = require('../config/app.config');
const logger = require('../utils/logger');

class VulnerableAuthService {
  /**
   * ❌ VULNERABLE LOGIN - Susceptible to NoSQL Injection
   * 
   * Problem: Directly passes user input to MongoDB query without validation
   * Attack: Send {"username": {"$ne": null}, "password": {"$ne": null}}
   * Result: Bypasses authentication by matching any user
   */
  async loginVulnerable({ username, password, ip = null, device = null }) {
    try {
      // ❌ DANGEROUS: No type validation - username and password could be objects!
      // If attacker sends {"$ne": null}, this becomes a MongoDB operator
      
      // Build query object directly from user input (VULNERABLE!)
      const query = { username };
      
      // If password is also provided in query (even more vulnerable)
      // This demonstrates the injection vulnerability
      const user = await User.findOne(query).exec();

      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // ❌ VULNERABLE: Skip password verification entirely!
      // In a real vulnerable app, this might check password incorrectly
      // For demo purposes, we just skip it to show the bypass
      
      logger.warn({ userId: user._id }, 'VULNERABLE LOGIN USED - User logged in via vulnerable endpoint');

      // Generate tokens
      let accessToken, refreshPlain, refreshHash, expiresAt;
      
      try {
        accessToken = signAccess({ 
          sub: user._id, 
          role: user.role, 
          username: user.username 
        });
        
        refreshPlain = genRefresh();
        refreshHash = hashToken(refreshPlain, config.jwt.refreshSecret);
        expiresAt = new Date(Date.now() + config.jwt.refreshExpiryDays * 24 * 3600 * 1000);

        // Add refresh token
        await User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              refreshTokens: { 
                tokenHash: refreshHash, 
                expiresAt, 
                deviceInfo: device, 
                ip, 
                createdAt: new Date() 
              }
            }
          }
        ).exec();
      } catch (tokenError) {
        logger.error({ error: tokenError.message }, 'Token generation failed');
        // Continue anyway for demo purposes
      }

      return { 
        accessToken: accessToken || 'demo-token',
        refreshToken: refreshPlain || 'demo-refresh',
        role: user.role,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        },
        warning: '⚠️ This login used VULNERABLE endpoint - for demonstration only!'
      };

    } catch (error) {
      logger.error({ error: error.message }, 'Vulnerable login failed');
      throw new Error('Invalid credentials');
    }
  }

  /**
   * Another vulnerable example - String concatenation in query
   * ❌ VULNERABLE: Building queries with string concatenation
   */
  async findUserVulnerable(username) {
    // This is vulnerable if username contains MongoDB operators
    return User.findOne({ username }).exec();
  }
}

module.exports = new VulnerableAuthService();
