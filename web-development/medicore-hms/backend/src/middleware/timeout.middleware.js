/**
 * timeout.middleware.js
 * 
 * Request timeout middleware to prevent hanging requests
 */

const logger = require('../utils/logger');

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Timeout middleware
 */
const timeout = (timeoutMs = DEFAULT_TIMEOUT) => {
  return (req, res, next) => {
    // Set timeout
    req.setTimeout(timeoutMs, () => {
      logger.warn({
        method: req.method,
        url: req.originalUrl,
        timeout: timeoutMs
      }, 'Request timeout');
      
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout'
        });
      }
    });
    
    next();
  };
};

module.exports = timeout;
