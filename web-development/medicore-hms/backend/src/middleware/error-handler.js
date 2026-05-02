/**
 * error-handler.js
 *
 * Central error-handling middleware.
 * MUST be the last middleware in the stack.
 *
 * Lab Manual Mapping:
 * - Clean structured logging for diagnosing issues during queries (Lab 07/08).
 */

const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl
  });

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};
