const { expect } = require('chai');
const lockingService = require('../src/services/locking.service');
const DocumentLock = require('../src/models/document-lock.model');
const { LockConflictError } = require('../src/errors/database.errors');
const mongoose = require('mongoose');

describe('Locking Service', () => {
  before(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/hospital-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    // Ensure indexes are created
    await DocumentLock.init();
  });

  after(async () => {
    // Clean up and disconnect
    await DocumentLock.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear locks before each test
    await DocumentLock.deleteMany({});
  });

  describe('acquireLock', () => {
    it('should successfully acquire a lock on a resource', async () => {
      const result = await lockingService.acquireLock('resource-1', 'user-1', 5000);
      
      expect(result).to.have.property('success', true);
      expect(result).to.have.property('lockId', 'resource-1');
      
      // Verify lock was created in database
      const lock = await DocumentLock.findOne({ resourceId: 'resource-1' });
      expect(lock).to.exist;
      expect(lock.lockHolder).to.equal('user-1');
    });

    it('should throw LockConflictError when resource is already locked', async () => {
      // First lock acquisition
      await lockingService.acquireLock('resource-2', 'user-1', 5000);
      
      // Second lock acquisition should fail
      try {
        await lockingService.acquireLock('resource-2', 'user-2', 5000);
        expect.fail('Should have thrown LockConflictError');
      } catch (err) {
        expect(err).to.be.instanceOf(LockConflictError);
        expect(err.lockInfo).to.exist;
        expect(err.lockInfo.lockHolder).to.equal('user-1');
      }
    });

    it('should set expiration time correctly', async () => {
      const timeout = 10000; // 10 seconds
      const beforeAcquire = Date.now();
      
      await lockingService.acquireLock('resource-3', 'user-1', timeout);
      
      const lock = await DocumentLock.findOne({ resourceId: 'resource-3' });
      const expectedExpiry = beforeAcquire + timeout;
      const actualExpiry = lock.expiresAt.getTime();
      
      // Allow 100ms tolerance for execution time
      expect(actualExpiry).to.be.closeTo(expectedExpiry, 100);
    });
  });

  describe('releaseLock', () => {
    it('should successfully release an acquired lock', async () => {
      await lockingService.acquireLock('resource-4', 'user-1', 5000);
      
      const released = await lockingService.releaseLock('resource-4', 'user-1');
      
      expect(released).to.be.true;
      
      // Verify lock was removed from database
      const lock = await DocumentLock.findOne({ resourceId: 'resource-4' });
      expect(lock).to.be.null;
    });

    it('should return false when lock does not exist', async () => {
      const released = await lockingService.releaseLock('non-existent', 'user-1');
      
      expect(released).to.be.false;
    });

    it('should return false when lock holder does not match', async () => {
      await lockingService.acquireLock('resource-5', 'user-1', 5000);
      
      const released = await lockingService.releaseLock('resource-5', 'user-2');
      
      expect(released).to.be.false;
      
      // Verify lock still exists
      const lock = await DocumentLock.findOne({ resourceId: 'resource-5' });
      expect(lock).to.exist;
    });
  });

  describe('withLock', () => {
    it('should execute callback while holding lock', async () => {
      let callbackExecuted = false;
      
      const result = await lockingService.withLock('resource-6', 'user-1', async () => {
        callbackExecuted = true;
        
        // Verify lock exists during callback execution
        const lock = await DocumentLock.findOne({ resourceId: 'resource-6' });
        expect(lock).to.exist;
        
        return 'callback-result';
      }, 5000);
      
      expect(callbackExecuted).to.be.true;
      expect(result).to.equal('callback-result');
      
      // Verify lock was released after callback
      const lock = await DocumentLock.findOne({ resourceId: 'resource-6' });
      expect(lock).to.be.null;
    });

    it('should release lock even if callback throws error', async () => {
      try {
        await lockingService.withLock('resource-7', 'user-1', async () => {
          throw new Error('Callback error');
        }, 5000);
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err.message).to.equal('Callback error');
      }
      
      // Verify lock was released despite error
      const lock = await DocumentLock.findOne({ resourceId: 'resource-7' });
      expect(lock).to.be.null;
    });

    it('should throw LockConflictError if resource is already locked', async () => {
      await lockingService.acquireLock('resource-8', 'user-1', 5000);
      
      try {
        await lockingService.withLock('resource-8', 'user-2', async () => {
          return 'should not execute';
        }, 5000);
        expect.fail('Should have thrown LockConflictError');
      } catch (err) {
        expect(err).to.be.instanceOf(LockConflictError);
      }
    });
  });

  describe('getLockInfo', () => {
    it('should return lock information for existing lock', async () => {
      await lockingService.acquireLock('resource-9', 'user-1', 5000);
      
      const lockInfo = await lockingService.getLockInfo('resource-9');
      
      expect(lockInfo).to.exist;
      expect(lockInfo.resourceId).to.equal('resource-9');
      expect(lockInfo.lockHolder).to.equal('user-1');
      expect(lockInfo.acquiredAt).to.be.instanceOf(Date);
      expect(lockInfo.expiresAt).to.be.instanceOf(Date);
    });

    it('should return null for non-existent lock', async () => {
      const lockInfo = await lockingService.getLockInfo('non-existent');
      
      expect(lockInfo).to.be.null;
    });
  });

  describe('cleanupExpiredLocks', () => {
    it('should remove expired locks', async () => {
      // Create a lock that expires immediately
      await DocumentLock.create({
        resourceId: 'expired-1',
        lockHolder: 'user-1',
        acquiredAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() - 5000) // Expired 5 seconds ago
      });
      
      // Create a valid lock
      await lockingService.acquireLock('valid-1', 'user-1', 10000);
      
      const cleanedCount = await lockingService.cleanupExpiredLocks();
      
      expect(cleanedCount).to.equal(1);
      
      // Verify expired lock was removed
      const expiredLock = await DocumentLock.findOne({ resourceId: 'expired-1' });
      expect(expiredLock).to.be.null;
      
      // Verify valid lock still exists
      const validLock = await DocumentLock.findOne({ resourceId: 'valid-1' });
      expect(validLock).to.exist;
    });

    it('should return 0 when no expired locks exist', async () => {
      await lockingService.acquireLock('valid-2', 'user-1', 10000);
      
      const cleanedCount = await lockingService.cleanupExpiredLocks();
      
      expect(cleanedCount).to.equal(0);
    });
  });

  describe('isLocked', () => {
    it('should return true for locked resource', async () => {
      await lockingService.acquireLock('resource-10', 'user-1', 5000);
      
      const locked = await lockingService.isLocked('resource-10');
      
      expect(locked).to.be.true;
    });

    it('should return false for unlocked resource', async () => {
      const locked = await lockingService.isLocked('non-existent');
      
      expect(locked).to.be.false;
    });

    it('should return false and cleanup expired lock', async () => {
      // Create an expired lock
      await DocumentLock.create({
        resourceId: 'expired-2',
        lockHolder: 'user-1',
        acquiredAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() - 1000)
      });
      
      const locked = await lockingService.isLocked('expired-2');
      
      expect(locked).to.be.false;
      
      // Verify lock was cleaned up
      const lock = await DocumentLock.findOne({ resourceId: 'expired-2' });
      expect(lock).to.be.null;
    });
  });

  describe('forceReleaseLock', () => {
    it('should force release a lock regardless of holder', async () => {
      await lockingService.acquireLock('resource-11', 'user-1', 5000);
      
      const released = await lockingService.forceReleaseLock('resource-11');
      
      expect(released).to.be.true;
      
      // Verify lock was removed
      const lock = await DocumentLock.findOne({ resourceId: 'resource-11' });
      expect(lock).to.be.null;
    });

    it('should return false when lock does not exist', async () => {
      const released = await lockingService.forceReleaseLock('non-existent');
      
      expect(released).to.be.false;
    });
  });
});
