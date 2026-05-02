/**
 * Tests for retry-helper utility
 */

const { expect } = require('chai');
const { 
  retryOnConflict, 
  createRetryWrapper, 
  isRetryableError,
  calculateDelay,
  DEFAULT_CONFIG
} = require('../src/utils/retry-helper');
const { VersionConflictError, LockConflictError, LockTimeoutError } = require('../src/errors/database.errors');

describe('Retry Helper Utility', () => {
  describe('isRetryableError', () => {
    it('should return true for VersionConflictError', () => {
      const error = new VersionConflictError('Version mismatch', 5);
      expect(isRetryableError(error)).to.be.true;
    });

    it('should return true for LockConflictError', () => {
      const error = new LockConflictError('Lock exists', { lockHolder: 'user1' });
      expect(isRetryableError(error)).to.be.true;
    });

    it('should return false for LockTimeoutError', () => {
      const error = new LockTimeoutError('Timeout');
      expect(isRetryableError(error)).to.be.false;
    });

    it('should return false for generic Error', () => {
      const error = new Error('Generic error');
      expect(isRetryableError(error)).to.be.false;
    });
  });

  describe('calculateDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      const config = { ...DEFAULT_CONFIG, jitterFactor: 0 }; // No jitter for predictable testing
      
      const delay0 = calculateDelay(0, config);
      const delay1 = calculateDelay(1, config);
      const delay2 = calculateDelay(2, config);
      
      expect(delay0).to.equal(100); // 100 * 2^0 = 100
      expect(delay1).to.equal(200); // 100 * 2^1 = 200
      expect(delay2).to.equal(400); // 100 * 2^2 = 400
    });

    it('should cap delay at maxDelayMs', () => {
      const config = { ...DEFAULT_CONFIG, maxDelayMs: 300, jitterFactor: 0 };
      
      const delay3 = calculateDelay(3, config); // Would be 800 without cap
      expect(delay3).to.equal(300);
    });

    it('should add jitter to delay', () => {
      const config = { ...DEFAULT_CONFIG, jitterFactor: 0.1 };
      
      const delays = [];
      for (let i = 0; i < 10; i++) {
        delays.push(calculateDelay(1, config));
      }
      
      // With jitter, delays should vary
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).to.be.greaterThan(1);
      
      // All delays should be within expected range (200 +/- 20)
      delays.forEach(delay => {
        expect(delay).to.be.at.least(180);
        expect(delay).to.be.at.most(220);
      });
    });
  });

  describe('retryOnConflict', () => {
    it('should succeed on first attempt without retry', async () => {
      let callCount = 0;
      const mockFn = async () => {
        callCount++;
        return 'success';
      };
      
      const result = await retryOnConflict(mockFn);
      
      expect(result).to.equal('success');
      expect(callCount).to.equal(1);
    });

    it('should retry on VersionConflictError and eventually succeed', async () => {
      let callCount = 0;
      const mockFn = async () => {
        callCount++;
        if (callCount === 1) throw new VersionConflictError('Conflict', 2);
        if (callCount === 2) throw new VersionConflictError('Conflict', 3);
        return 'success';
      };
      
      const result = await retryOnConflict(mockFn, { 
        maxRetries: 3,
        initialDelayMs: 10 // Fast for testing
      });
      
      expect(result).to.equal('success');
      expect(callCount).to.equal(3);
    });

    it('should retry on LockConflictError and eventually succeed', async () => {
      let callCount = 0;
      const mockFn = async () => {
        callCount++;
        if (callCount === 1) throw new LockConflictError('Locked', { lockHolder: 'user1' });
        return 'success';
      };
      
      const result = await retryOnConflict(mockFn, { 
        maxRetries: 3,
        initialDelayMs: 10
      });
      
      expect(result).to.equal('success');
      expect(callCount).to.equal(2);
    });

    it('should throw error after max retries exhausted', async () => {
      let callCount = 0;
      const mockFn = async () => {
        callCount++;
        throw new VersionConflictError('Conflict', 5);
      };
      
      try {
        await retryOnConflict(mockFn, { maxRetries: 2, initialDelayMs: 10 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).to.be.instanceOf(VersionConflictError);
        expect(callCount).to.equal(3); // Initial + 2 retries
      }
    });

    it('should not retry non-retryable errors', async () => {
      let callCount = 0;
      const mockFn = async () => {
        callCount++;
        throw new Error('Generic error');
      };
      
      try {
        await retryOnConflict(mockFn, { maxRetries: 3, initialDelayMs: 10 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('Generic error');
        expect(callCount).to.equal(1); // No retries
      }
    });

    it('should call onRetry callback before each retry', async () => {
      let callCount = 0;
      let onRetryCallCount = 0;
      let onRetryArgs = null;
      
      const onRetry = async (error, attempt, delay) => {
        onRetryCallCount++;
        onRetryArgs = { error, attempt, delay };
      };
      
      const mockFn = async () => {
        callCount++;
        if (callCount === 1) throw new VersionConflictError('Conflict', 2);
        return 'success';
      };
      
      await retryOnConflict(mockFn, { 
        maxRetries: 3,
        initialDelayMs: 10,
        onRetry
      });
      
      expect(onRetryCallCount).to.equal(1);
      expect(onRetryArgs.error).to.be.instanceOf(VersionConflictError);
      expect(onRetryArgs.attempt).to.equal(0); // attempt number
      expect(onRetryArgs.delay).to.be.a('number'); // delay
    });

    it('should respect custom maxRetries configuration', async () => {
      let callCount = 0;
      const mockFn = async () => {
        callCount++;
        throw new VersionConflictError('Conflict', 5);
      };
      
      try {
        await retryOnConflict(mockFn, { maxRetries: 5, initialDelayMs: 10 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).to.be.instanceOf(VersionConflictError);
        expect(callCount).to.equal(6); // Initial + 5 retries
      }
    });

    it('should handle async onRetry callback errors gracefully', async () => {
      let callCount = 0;
      const onRetry = async () => {
        throw new Error('Callback error');
      };
      
      const mockFn = async () => {
        callCount++;
        if (callCount === 1) throw new VersionConflictError('Conflict', 2);
        return 'success';
      };
      
      // Should not throw despite callback error
      const result = await retryOnConflict(mockFn, { 
        maxRetries: 3,
        initialDelayMs: 10,
        onRetry
      });
      
      expect(result).to.equal('success');
    });
  });

  describe('createRetryWrapper', () => {
    it('should create a wrapper function with pre-configured options', async () => {
      const retryWrapper = createRetryWrapper({ 
        maxRetries: 5, 
        initialDelayMs: 10 
      });
      
      let callCount = 0;
      const mockFn = async () => {
        callCount++;
        if (callCount === 1) throw new VersionConflictError('Conflict', 2);
        return 'success';
      };
      
      const result = await retryWrapper(mockFn);
      
      expect(result).to.equal('success');
      expect(callCount).to.equal(2);
    });

    it('should allow reusing the same wrapper for multiple operations', async () => {
      const retryWrapper = createRetryWrapper({ 
        maxRetries: 3, 
        initialDelayMs: 10 
      });
      
      const mockFn1 = async () => 'result1';
      const mockFn2 = async () => 'result2';
      
      const result1 = await retryWrapper(mockFn1);
      const result2 = await retryWrapper(mockFn2);
      
      expect(result1).to.equal('result1');
      expect(result2).to.equal('result2');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle realistic update scenario with version conflicts', async () => {
      let currentVersion = 1;
      
      // Simulate a function that updates a document
      const updateDocument = async () => {
        // Simulate another user updating the document
        if (currentVersion < 3) {
          const expectedVersion = currentVersion;
          currentVersion++;
          throw new VersionConflictError(
            `Version conflict: expected ${expectedVersion}, current is ${currentVersion}`,
            currentVersion
          );
        }
        return { id: '123', version: currentVersion, data: 'updated' };
      };
      
      const result = await retryOnConflict(updateDocument, {
        maxRetries: 5,
        initialDelayMs: 10,
        operationName: 'updatePatient'
      });
      
      expect(result).to.deep.equal({ id: '123', version: 3, data: 'updated' });
      expect(currentVersion).to.equal(3);
    });

    it('should handle lock acquisition with temporary conflicts', async () => {
      let lockAttempts = 0;
      
      const acquireLock = async () => {
        lockAttempts++;
        if (lockAttempts < 3) {
          throw new LockConflictError('Resource locked', {
            resourceId: 'doc123',
            lockHolder: 'user1',
            acquiredAt: new Date(),
            expiresAt: new Date(Date.now() + 5000)
          });
        }
        return { lockId: 'lock123', acquired: true };
      };
      
      const result = await retryOnConflict(acquireLock, {
        maxRetries: 5,
        initialDelayMs: 10,
        operationName: 'acquireLock'
      });
      
      expect(result).to.deep.equal({ lockId: 'lock123', acquired: true });
      expect(lockAttempts).to.equal(3);
    });
  });
});
