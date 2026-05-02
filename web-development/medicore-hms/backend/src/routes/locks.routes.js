/**
 * locks.routes.js
 * 
 * API routes for demonstrating pessimistic locking
 * Used for testing and demonstration purposes
 */

const express = require('express');
const router = express.Router();
const lockingService = require('../services/locking.service');
const asyncHandler = require('../middleware/async-handler');
const auth = require('../middleware/auth.middleware');

/**
 * POST /api/locks
 * Acquire a lock on a resource
 */
router.post('/', asyncHandler(async (req, res) => {
  const { resourceId, lockHolder, timeout } = req.body;
  
  if (!resourceId || !lockHolder) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'resourceId and lockHolder are required'
    });
  }
  
  const result = await lockingService.acquireLock(
    resourceId, 
    lockHolder, 
    timeout || 30000
  );
  
  res.status(201).json({
    success: true,
    message: 'Lock acquired successfully',
    lockId: result.lockId
  });
}));

/**
 * GET /api/locks/:resourceId
 * Get information about a lock
 */
router.get('/:resourceId', asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  
  const lockInfo = await lockingService.getLockInfo(resourceId);
  
  if (!lockInfo) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'No lock found for this resource'
    });
  }
  
  res.json({
    success: true,
    data: lockInfo
  });
}));

/**
 * DELETE /api/locks/:resourceId
 * Release a lock on a resource
 */
router.delete('/:resourceId', asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { lockHolder } = req.query;
  
  if (!lockHolder) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'lockHolder query parameter is required'
    });
  }
  
  const released = await lockingService.releaseLock(resourceId, lockHolder);
  
  if (!released) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Lock not found or not held by this lock holder'
    });
  }
  
  res.json({
    success: true,
    message: 'Lock released successfully'
  });
}));

/**
 * GET /api/locks/:resourceId/status
 * Check if a resource is locked
 */
router.get('/:resourceId/status', asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  
  const isLocked = await lockingService.isLocked(resourceId);
  
  res.json({
    success: true,
    resourceId,
    isLocked
  });
}));

/**
 * POST /api/locks/cleanup
 * Manually cleanup expired locks (admin only)
 */
router.post('/cleanup', asyncHandler(async (req, res) => {
  const count = await lockingService.cleanupExpiredLocks();
  
  res.json({
    success: true,
    message: `Cleaned up ${count} expired locks`,
    count
  });
}));

module.exports = router;
