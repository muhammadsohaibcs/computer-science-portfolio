const { expect } = require('chai');
const conflictHandler = require('../src/middleware/conflict-handler.middleware');
const { 
  VersionConflictError, 
  LockConflictError, 
  LockTimeoutError 
} = require('../src/errors/database.errors');

describe('Conflict Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request object
    req = {
      path: '/api/patients/123',
      method: 'PUT',
      user: { id: 'user-123' }
    };

    // Mock response object
    res = {
      statusCode: null,
      jsonData: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.jsonData = data;
        return this;
      }
    };

    // Mock next function with tracking
    let nextCalledWith = null;
    next = function(err) {
      nextCalledWith = err;
    };
    next.getCalledWith = () => nextCalledWith;
  });

  describe('VersionConflictError handling', () => {
    it('should return 409 status code for version conflicts', () => {
      const error = new VersionConflictError('Version mismatch', 5);
      
      conflictHandler(error, req, res, next);
      
      expect(res.statusCode).to.equal(409);
    });

    it('should include current version in response', () => {
      const error = new VersionConflictError('Version mismatch', 5);
      
      conflictHandler(error, req, res, next);
      
      expect(res.jsonData).to.have.property('currentVersion', 5);
      expect(res.jsonData).to.have.property('code', 'VERSION_CONFLICT');
    });

    it('should return user-friendly error message', () => {
      const error = new VersionConflictError('Version mismatch', 5);
      
      conflictHandler(error, req, res, next);
      
      expect(res.jsonData.message).to.include('modified by another user');
    });
  });

  describe('LockConflictError handling', () => {
    it('should return 409 status code for lock conflicts', () => {
      const lockInfo = {
        resourceId: 'resource-1',
        lockHolder: 'user-456',
        acquiredAt: new Date(),
        expiresAt: new Date(Date.now() + 30000)
      };
      const error = new LockConflictError('Resource is locked', lockInfo);
      
      conflictHandler(error, req, res, next);
      
      expect(res.statusCode).to.equal(409);
    });

    it('should include lock information in response', () => {
      const lockInfo = {
        resourceId: 'resource-1',
        lockHolder: 'user-456',
        acquiredAt: new Date(),
        expiresAt: new Date(Date.now() + 30000)
      };
      const error = new LockConflictError('Resource is locked', lockInfo);
      
      conflictHandler(error, req, res, next);
      
      expect(res.jsonData).to.have.property('lockInfo');
      expect(res.jsonData.lockInfo).to.deep.equal(lockInfo);
      expect(res.jsonData).to.have.property('code', 'LOCK_CONFLICT');
    });

    it('should return user-friendly error message', () => {
      const lockInfo = {
        resourceId: 'resource-1',
        lockHolder: 'user-456',
        acquiredAt: new Date(),
        expiresAt: new Date(Date.now() + 30000)
      };
      const error = new LockConflictError('Resource is locked', lockInfo);
      
      conflictHandler(error, req, res, next);
      
      expect(res.jsonData.message).to.include('currently locked');
    });
  });

  describe('LockTimeoutError handling', () => {
    it('should return 408 status code for lock timeouts', () => {
      const error = new LockTimeoutError('Lock acquisition timed out');
      
      conflictHandler(error, req, res, next);
      
      expect(res.statusCode).to.equal(408);
    });

    it('should include timeout code in response', () => {
      const error = new LockTimeoutError('Lock acquisition timed out');
      
      conflictHandler(error, req, res, next);
      
      expect(res.jsonData).to.have.property('code', 'LOCK_TIMEOUT');
    });

    it('should return user-friendly error message', () => {
      const error = new LockTimeoutError('Lock acquisition timed out');
      
      conflictHandler(error, req, res, next);
      
      expect(res.jsonData.message).to.include('timed out');
    });
  });

  describe('Non-conflict error handling', () => {
    it('should pass non-conflict errors to next middleware', () => {
      const error = new Error('Some other error');
      
      conflictHandler(error, req, res, next);
      
      expect(next.getCalledWith()).to.equal(error);
      expect(res.statusCode).to.be.null;
    });
  });
});
