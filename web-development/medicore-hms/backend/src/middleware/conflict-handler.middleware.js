/**
 * Conflict Handler Middleware
 * 
 * Handles database-related conflicts including version conflicts (optimistic locking),
 * lock conflicts (pessimistic locking), and lock timeouts.
 * 
 * This middleware should be registered after route handlers but before the generic
 * error handler to properly catch and format conflict errors.
 */

const logger = require('../utils/logger');
const { 
  VersionConflictError, 
  LockConflictError, 
  LockTimeoutError 
} = require('../errors/database.errors');

/**
 * Middleware to handle version conflicts and lock conflicts
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function conflictHandler(err, req, res, next) {
  // Handle Version Conflict Error (Optimistic Locking)
  if (err instanceof VersionConflictError) {
    logger.warn({
      error: err.message,
      errorName: err.name,
      currentVersion: err.currentVersion,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    }, 'Version conflict detected');
    
    return res.status(409).json({
      error: 'Conflict',
      message: 'The document has been modified by another user. Please refresh and try again.',
      currentVersion: err.currentVersion,
      code: 'VERSION_CONFLICT'
    });
  }
  
  // Handle Lock Conflict Error (Pessimistic Locking)
  if (err instanceof LockConflictError) {
    logger.warn({
      error: err.message,
      errorName: err.name,
      lockInfo: err.lockInfo,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    }, 'Lock conflict detected');
    
    return res.status(409).json({
      error: 'Conflict',
      message: 'The resource is currently locked by another operation. Please try again later.',
      lockInfo: err.lockInfo,
      code: 'LOCK_CONFLICT'
    });
  }
  
  // Handle Lock Timeout Error
  if (err instanceof LockTimeoutError) {
    logger.error({
      error: err.message,
      errorName: err.name,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    }, 'Lock timeout');
    
    return res.status(408).json({
      error: 'Timeout',
      message: 'Operation timed out while waiting for lock.',
      code: 'LOCK_TIMEOUT'
    });
  }
  
  // If not a conflict error, pass to next error handler
  next(err);
}

module.exports = conflictHandler;
