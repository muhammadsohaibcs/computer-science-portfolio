/**
 * locking.service.js
 *
 * Pessimistic locking service using a dedicated locks collection.
 * Provides methods to acquire, release, and manage document locks.
 *
 * Requirements: 2.1, 2.2, 2.4, 2.5
 */

const DocumentLock = require('../models/document-lock.model');
const { LockConflictError, LockTimeoutError } = require('../errors/database.errors');
const logger = require('../utils/logger');

/**
 * Service for managing pessimistic locks on resources
 */
class LockingService {
  constructor() {
    this.defaultTimeout = 30000; // 30 seconds default timeout
  }

  /**
   * Acquire a lock on a resource
   * 
   * @param {string} resourceId - Unique identifier for the resource to lock
   * @param {string} lockHolder - Identifier of the entity acquiring the lock (user ID, session ID, etc.)
   * @param {number} timeout - Lock timeout in milliseconds (default: 30000)
   * @returns {Promise<Object>} Lock information { success: true, lockId: resourceId }
   * @throws {LockConflictError} If the resource is already locked
   * 
   * Validates: Requirements 2.1, 2.2, 2.5
   */
  async acquireLock(resourceId, lockHolder, timeout = this.defaultTimeout) {
    // First, clean up any expired locks for this resource
    await DocumentLock.deleteMany({ 
      resourceId,
      expiresAt: { $lt: new Date() } 
    });
    
    const expiresAt = new Date(Date.now() + timeout);
    
    try {
      const lock = await DocumentLock.create({
        resourceId,
        lockHolder,
        acquiredAt: new Date(),
        expiresAt
      });
      
      logger.info({
        resourceId,
        lockHolder,
        expiresAt,
        action: 'lock_acquired'
      }, 'Lock acquired successfully');
      
      return { success: true, lockId: resourceId };
    } catch (err) {
      // Handle duplicate key error (E11000) - resource is already locked
      if (err.code === 11000 || (err.name === 'MongoServerError' && err.message.includes('duplicate key'))) {
        const existingLock = await this.getLockInfo(resourceId);
        
        // Check if the existing lock has expired
        if (existingLock && new Date(existingLock.expiresAt) < new Date()) {
          // Lock has expired, delete it and try again
          await DocumentLock.deleteOne({ resourceId });
          return this.acquireLock(resourceId, lockHolder, timeout);
        }
        
        logger.warn({
          resourceId,
          lockHolder,
          existingLock,
          action: 'lock_conflict'
        }, 'Lock conflict: resource is already locked');
        
        throw new LockConflictError('Resource is locked', existingLock);
      }
      
      // Re-throw other errors
      logger.error({
        resourceId,
        lockHolder,
        error: err.message,
        action: 'lock_acquisition_failed'
      }, 'Failed to acquire lock');
      
      throw err;
    }
  }

  /**
   * Release a lock on a resource
   * 
   * @param {string} resourceId - Unique identifier for the resource
   * @param {string} lockHolder - Identifier of the entity releasing the lock
   * @returns {Promise<boolean>} True if lock was released, false if lock didn't exist or wasn't held by lockHolder
   * 
   * Validates: Requirements 2.4
   */
  async releaseLock(resourceId, lockHolder) {
    const result = await DocumentLock.deleteOne({ 
      resourceId, 
      lockHolder 
    });
    
    const released = result.deletedCount > 0;
    
    if (released) {
      logger.info({
        resourceId,
        lockHolder,
        action: 'lock_released'
      }, 'Lock released successfully');
    } else {
      logger.warn({
        resourceId,
        lockHolder,
        action: 'lock_release_failed'
      }, 'Lock release failed: lock not found or not held by this holder');
    }
    
    return released;
  }

  /**
   * Execute a callback function while holding a lock
   * Automatically acquires lock before execution and releases it after
   * 
   * @param {string} resourceId - Unique identifier for the resource
   * @param {string} lockHolder - Identifier of the entity acquiring the lock
   * @param {Function} callback - Async function to execute while holding the lock
   * @param {number} timeout - Lock timeout in milliseconds (default: 30000)
   * @returns {Promise<*>} Result of the callback function
   * @throws {LockConflictError} If the resource is already locked
   * 
   * Validates: Requirements 2.1, 2.2, 2.4
   */
  async withLock(resourceId, lockHolder, callback, timeout = this.defaultTimeout) {
    await this.acquireLock(resourceId, lockHolder, timeout);
    
    try {
      logger.debug({
        resourceId,
        lockHolder,
        action: 'executing_with_lock'
      }, 'Executing callback with lock held');
      
      const result = await callback();
      return result;
    } finally {
      // Always release the lock, even if callback throws
      await this.releaseLock(resourceId, lockHolder);
    }
  }

  /**
   * Get information about an existing lock
   * 
   * @param {string} resourceId - Unique identifier for the resource
   * @returns {Promise<Object|null>} Lock information or null if no lock exists
   * 
   * Validates: Requirements 2.5
   */
  async getLockInfo(resourceId) {
    const lock = await DocumentLock.findOne({ resourceId });
    
    if (!lock) {
      return null;
    }
    
    return {
      resourceId: lock.resourceId,
      lockHolder: lock.lockHolder,
      acquiredAt: lock.acquiredAt,
      expiresAt: lock.expiresAt
    };
  }

  /**
   * Clean up expired locks manually
   * Note: MongoDB TTL index handles automatic cleanup, but this can be used for immediate cleanup
   * 
   * @returns {Promise<number>} Number of expired locks removed
   * 
   * Validates: Requirements 2.3
   */
  async cleanupExpiredLocks() {
    const result = await DocumentLock.deleteMany({ 
      expiresAt: { $lt: new Date() } 
    });
    
    if (result.deletedCount > 0) {
      logger.info({
        count: result.deletedCount,
        action: 'expired_locks_cleaned'
      }, `Cleaned up ${result.deletedCount} expired locks`);
    }
    
    return result.deletedCount;
  }

  /**
   * Check if a resource is currently locked
   * 
   * @param {string} resourceId - Unique identifier for the resource
   * @returns {Promise<boolean>} True if resource is locked, false otherwise
   */
  async isLocked(resourceId) {
    const lock = await DocumentLock.findOne({ resourceId });
    
    if (!lock) {
      return false;
    }
    
    // Check if lock has expired
    if (lock.expiresAt < new Date()) {
      // Lock has expired but TTL hasn't cleaned it up yet
      await DocumentLock.deleteOne({ resourceId });
      return false;
    }
    
    return true;
  }

  /**
   * Force release a lock (admin operation)
   * Use with caution - this bypasses lock holder validation
   * 
   * @param {string} resourceId - Unique identifier for the resource
   * @returns {Promise<boolean>} True if lock was released, false if no lock existed
   */
  async forceReleaseLock(resourceId) {
    const result = await DocumentLock.deleteOne({ resourceId });
    
    if (result.deletedCount > 0) {
      logger.warn({
        resourceId,
        action: 'lock_force_released'
      }, 'Lock forcefully released (admin operation)');
    }
    
    return result.deletedCount > 0;
  }
}

// Export singleton instance
module.exports = new LockingService();
