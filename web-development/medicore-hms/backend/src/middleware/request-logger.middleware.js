/**
 * request-logger.middleware.js
 * 
 * Logs all incoming HTTP requests for monitoring and debugging
 */

const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.id || 'anonymous'
  }, 'Incoming request');

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous'
    }, 'Request completed');
  });

  next();
};
