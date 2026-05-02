/**
 * src/models/document-lock.model.js
 *
 * Document lock model for pessimistic locking mechanism.
 *
 * Design notes:
 * - resourceId is unique to ensure only one lock per resource
 * - TTL index on expiresAt enables automatic cleanup of expired locks
 * - Used by locking.service.js for pessimistic concurrency control
 * - Requirements: 2.1, 2.3
 */

const mongoose = require('mongoose');

const lockSchema = new mongoose.Schema({
  resourceId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  lockHolder: { 
    type: String, 
    required: true 
  },
  acquiredAt: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    required: true, 
    index: true 
  }
}, { 
  timestamps: false 
});

// TTL index for automatic cleanup of expired locks
// expireAfterSeconds: 0 means documents are removed immediately after expiresAt time
lockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('DocumentLock', lockSchema);
