/**
 * Custom error classes for database operations
 * These errors handle version conflicts, lock conflicts, and lock timeouts
 */

/**
 * Error thrown when a version conflict occurs during optimistic locking
 * @extends Error
 */
class VersionConflictError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} currentVersion - The current version of the document
   */
  constructor(message, currentVersion) {
    super(message);
    this.name = 'VersionConflictError';
    this.statusCode = 409;
    this.currentVersion = currentVersion;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VersionConflictError);
    }
  }
}

/**
 * Error thrown when a lock conflict occurs during pessimistic locking
 * @extends Error
 */
class LockConflictError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Object} lockInfo - Information about the existing lock
   * @param {string} lockInfo.resourceId - The ID of the locked resource
   * @param {string} lockInfo.lockHolder - The holder of the current lock
   * @param {Date} lockInfo.acquiredAt - When the lock was acquired
   * @param {Date} lockInfo.expiresAt - When the lock will expire
   */
  constructor(message, lockInfo) {
    super(message);
    this.name = 'LockConflictError';
    this.statusCode = 409;
    this.lockInfo = lockInfo;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LockConflictError);
    }
  }
}

/**
 * Error thrown when a lock operation times out
 * @extends Error
 */
class LockTimeoutError extends Error {
  /**
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message);
    this.name = 'LockTimeoutError';
    this.statusCode = 408;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LockTimeoutError);
    }
  }
}

module.exports = {
  VersionConflictError,
  LockConflictError,
  LockTimeoutError
};
