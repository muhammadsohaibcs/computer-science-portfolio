/**
 * sanitize.middleware.js
 *
 * Prevents NoSQL injection by removing dangerous keys from:
 *  - req.body
 *  - req.query
 *  - req.params
 *
 * Lab Manual Mapping:
 * - DIRECT mapping to Lab 14 (NoSQL Injection Mitigation)
 *   Demonstrates why `$gt`, `$ne`, `$where`, `$regex` can bypass filters.
 */

const securityConf = require('../config/security.config');
const logger = require('../utils/logger');

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    // 1. Disallow $ prefixed keys
    if (securityConf.sanitize.rejectDollarKeys && key.startsWith('$')) {
      delete obj[key];
      if (securityConf.sanitize.auditRejected)
        logger.warn({ key }, 'Blocked $ operator key (NoSQL injection attempt)');
      continue;
    }

    // 2. Disallow dot notation in keys
    if (securityConf.sanitize.rejectDotKeys && key.includes('.')) {
      delete obj[key];
      if (securityConf.sanitize.auditRejected)
        logger.warn({ key }, 'Blocked dotted key (NoSQL injection attempt)');
      continue;
    }

    // 3. Recursively sanitize nested objects
    if (typeof obj[key] === 'object') sanitizeObject(obj[key]);
  }
}

module.exports = (req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};
