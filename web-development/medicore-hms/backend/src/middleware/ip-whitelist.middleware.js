/**
 * ip-whitelist.middleware.js
 * 
 * IP whitelisting for admin routes
 * Optional security layer for sensitive operations
 */

const logger = require('../utils/logger');

// Admin IP whitelist (configure in production)
const ADMIN_WHITELIST = process.env.ADMIN_IP_WHITELIST 
  ? process.env.ADMIN_IP_WHITELIST.split(',')
  : [];

// Enable/disable IP whitelisting
const IP_WHITELIST_ENABLED = process.env.IP_WHITELIST_ENABLED === 'true';

/**
 * IP whitelist middleware for admin routes
 */
const ipWhitelist = (req, res, next) => {
  // Skip if not enabled or no whitelist configured
  if (!IP_WHITELIST_ENABLED || ADMIN_WHITELIST.length === 0) {
    return next();
  }
  
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Check if IP is whitelisted
  if (ADMIN_WHITELIST.includes(clientIp)) {
    return next();
  }
  
  // Log unauthorized access attempt
  logger.warn({
    ip: clientIp,
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent')
  }, 'Unauthorized IP access attempt to admin route');
  
  return res.status(403).json({
    error: 'Access denied: IP not whitelisted'
  });
};

module.exports = ipWhitelist;
