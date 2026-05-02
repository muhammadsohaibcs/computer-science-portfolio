/**
 * base.repo.js
 *
 * Generic repository providing CRUD, pagination, explain(), session support,
 * and locking methods (optimistic and pessimistic).
 * All other repos extend this class.
 */

const lockingService = require('../services/locking.service');
const { VersionConflictError } = require('../errors/database.errors');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a single document. If session passed, it will be used (for transactions).
   */
  async create(data, session = null) {
    if (session) {
      const docs = await this.model.create([data], { session });
      return docs[0];
    }
    return this.model.create(data);
  }

  async findById(id, projection = null) {
    return this.model.findById(id, projection).lean().exec();
  }

  async findOne(filter = {}, projection = null) {
    return this.model.findOne(filter, projection).lean().exec();
  }

  /**
   * Generic find with pagination support.
   * options: { page, limit, skip, sort, lean }
   */
  async find(filter = {}, projection = null, options = {}) {
    const page = options.page ? Math.max(1, Number(options.page)) : 1;
    const limit = options.limit ? Math.min(Number(options.limit), 1000) : (options.limit || 20);
    const skip = options.skip || (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };
    const q = this.model.find(filter, projection).skip(skip).limit(Number(limit)).sort(sort);
    if (options.lean !== false) q.lean();
    return q.exec();
  }

  async updateById(id, update, options = {}) {
    // options may include { session, upsert, new }
    const opts = Object.assign({ new: true }, options);
    return this.model.findByIdAndUpdate(id, update, opts).exec();
  }

  async findOneAndUpdate(filter, update, options = {}) {
    return this.model.findOneAndUpdate(filter, update, Object.assign({ new: true }, options)).exec();
  }

  async deleteById(id, session = null) {
    if (session) return this.model.findByIdAndDelete(id, { session }).exec();
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter).exec();
  }

  /**
   * Run explain() on a current query for Lab 07 & Lab 08 analysis.
   * type can be 'queryPlanner' | 'executionStats' | 'allPlansExecution'
   */
  async explainQuery(filter = {}, type = 'executionStats') {
    return this.model.find(filter).explain(type);
  }

  /**
   * Run aggregation pipeline
   */
  async aggregate(pipeline = []) {
    return this.model.aggregate(pipeline).exec();
  }

  // ============================================================================
  // OPTIMISTIC LOCKING METHODS
  // ============================================================================

  /**
   * Update a document with optimistic locking (version-based concurrency control)
   * 
   * This method performs an atomic update that only succeeds if the document version
   * matches the expected version. This prevents lost updates in concurrent scenarios.
   * 
   * @param {string|ObjectId} id - Document ID
   * @param {number} version - Expected current version of the document
   * @param {Object} update - Update operations to apply
   * @param {Object} options - Additional options for findOneAndUpdate
   * @returns {Promise<Document>} Updated document with incremented version
   * @throws {Error} If version parameter is invalid
   * @throws {VersionConflictError} If version mismatch occurs
   * @throws {Error} If model does not support optimistic locking
   * 
   * Requirements: 5.1, 5.2, 5.4
   * 
   * @example
   * // Fetch document with current version
   * const patient = await patientRepo.findById('123');
   * 
   * // Update with version check
   * const updated = await patientRepo.optimisticUpdate(
   *   '123', 
   *   patient.__v, 
   *   { $set: { name: 'John Doe' } }
   * );
   */
  async optimisticUpdate(id, version, update, options = {}) {
    // Validate version parameter (Requirement 5.2)
    if (version === null || version === undefined) {
      const error = new Error('Version parameter is required for optimistic updates');
      error.name = 'ValidationError';
      error.statusCode = 400;
      throw error;
    }

    if (typeof version !== 'number' || version < 0 || !Number.isInteger(version)) {
      const error = new Error('Version parameter must be a non-negative integer');
      error.name = 'ValidationError';
      error.statusCode = 400;
      throw error;
    }

    // Check if model supports optimistic locking
    if (!this.model.updateWithVersion) {
      throw new Error(`Model ${this.model.modelName} does not support optimistic locking. Apply the optimisticLockingPlugin to the schema.`);
    }

    // Perform version-aware update (Requirement 5.1)
    try {
      return await this.model.updateWithVersion(id, version, update, options);
    } catch (err) {
      // Enhance error with additional context for debugging (Requirement 5.4)
      if (err instanceof VersionConflictError) {
        err.attemptedVersion = version;
        err.documentId = id;
      }
      throw err;
    }
  }

  // ============================================================================
  // PESSIMISTIC LOCKING METHODS
  // ============================================================================

  /**
   * Find a document by ID and acquire a pessimistic lock on it
   * 
   * This method fetches a document and simultaneously acquires an exclusive lock,
   * preventing other operations from modifying the document until the lock is released.
   * 
   * @param {string|ObjectId} id - Document ID
   * @param {string} lockHolder - Identifier of the entity acquiring the lock (user ID, session ID, etc.)
   * @param {number} timeout - Lock timeout in milliseconds (default: 30000)
   * @returns {Promise<Document>} The document (or null if not found)
   * @throws {LockConflictError} If the resource is already locked
   * 
   * Requirements: 5.1
   * 
   * @example
   * // Acquire lock and fetch document
   * const patient = await patientRepo.findByIdWithLock('123', 'user-456', 30000);
   * 
   * // Perform operations...
   * 
   * // Release lock when done
   * await patientRepo.releaseLock('123', 'user-456');
   */
  async findByIdWithLock(id, lockHolder, timeout = 30000) {
    // Acquire lock first
    await lockingService.acquireLock(id.toString(), lockHolder, timeout);
    
    // Then fetch the document
    try {
      return await this.findById(id);
    } catch (err) {
      // If fetch fails, release the lock to avoid orphaned locks
      await lockingService.releaseLock(id.toString(), lockHolder);
      throw err;
    }
  }

  /**
   * Release a pessimistic lock on a document
   * 
   * @param {string|ObjectId} id - Document ID
   * @param {string} lockHolder - Identifier of the entity releasing the lock
   * @returns {Promise<boolean>} True if lock was released, false if lock didn't exist or wasn't held by lockHolder
   * 
   * Requirements: 5.1
   * 
   * @example
   * await patientRepo.releaseLock('123', 'user-456');
   */
  async releaseLock(id, lockHolder) {
    return lockingService.releaseLock(id.toString(), lockHolder);
  }

  /**
   * Execute a callback function while holding a pessimistic lock
   * 
   * This method automatically acquires a lock before executing the callback
   * and releases it afterwards, even if the callback throws an error.
   * 
   * @param {string|ObjectId} id - Document ID
   * @param {string} lockHolder - Identifier of the entity acquiring the lock
   * @param {Function} callback - Async function to execute while holding the lock
   * @param {number} timeout - Lock timeout in milliseconds (default: 30000)
   * @returns {Promise<*>} Result of the callback function
   * @throws {LockConflictError} If the resource is already locked
   * 
   * Requirements: 5.1, 5.5
   * 
   * @example
   * // Perform multi-step operation with lock protection
   * const result = await patientRepo.withLock('123', 'user-456', async () => {
   *   const patient = await patientRepo.findById('123');
   *   
   *   // Perform complex operations...
   *   await someService.doSomething(patient);
   *   
   *   // Update patient
   *   return await patientRepo.updateById('123', { $set: { status: 'processed' } });
   * }, 30000);
   */
  async withLock(id, lockHolder, callback, timeout = 30000) {
    return lockingService.withLock(id.toString(), lockHolder, callback, timeout);
  }

  /**
   * Update a document within a transaction with version checking
   * 
   * This method combines optimistic locking with MongoDB transactions to ensure
   * version checks occur atomically within the transaction boundary.
   * 
   * @param {string|ObjectId} id - Document ID
   * @param {number} version - Expected current version of the document
   * @param {Object} update - Update operations to apply
   * @param {Object} session - MongoDB session for transaction
   * @param {Object} options - Additional options for findOneAndUpdate
   * @returns {Promise<Document>} Updated document
   * @throws {VersionConflictError} If version mismatch occurs
   * 
   * Requirements: 5.5
   * 
   * @example
   * const session = await mongoose.startSession();
   * await session.withTransaction(async () => {
   *   const updated = await patientRepo.updateWithTransaction(
   *     '123',
   *     5,
   *     { $set: { name: 'John Doe' } },
   *     session
   *   );
   * });
   */
  async updateWithTransaction(id, version, update, session, options = {}) {
    // Validate version parameter
    if (version === null || version === undefined) {
      const error = new Error('Version parameter is required for transactional updates');
      error.name = 'ValidationError';
      error.statusCode = 400;
      throw error;
    }

    if (typeof version !== 'number' || version < 0 || !Number.isInteger(version)) {
      const error = new Error('Version parameter must be a non-negative integer');
      error.name = 'ValidationError';
      error.statusCode = 400;
      throw error;
    }

    // Ensure session is provided
    if (!session) {
      throw new Error('Session is required for transactional updates');
    }

    // Perform version-aware update within transaction
    const versionField = '__v';
    const filter = { 
      _id: id, 
      [versionField]: version 
    };
    
    const updateDoc = { 
      ...update, 
      $inc: { [versionField]: 1 } 
    };
    
    const result = await this.model.findOneAndUpdate(
      filter, 
      updateDoc, 
      { new: true, session, ...options }
    );
    
    if (!result) {
      const current = await this.model.findById(id).session(session);
      
      if (!current) {
        const error = new Error(`Document with id ${id} not found`);
        error.name = 'DocumentNotFoundError';
        error.statusCode = 404;
        throw error;
      }
      
      throw new VersionConflictError(
        `Version conflict: expected ${version}, current is ${current[versionField]}`,
        current[versionField]
      );
    }
    
    return result;
  }

  // ============================================================================
  // REPLICATION METHODS
  // ============================================================================

  /**
   * Find documents with a specific read preference
   * 
   * This method allows controlling where read operations are routed in a replica set.
   * Use this for operations that can tolerate eventual consistency or need to reduce
   * load on the primary node.
   * 
   * @param {Object} filter - Query filter
   * @param {Object} projection - Fields to include/exclude
   * @param {Object} options - Query options (page, limit, sort, etc.)
   * @param {string} readPreference - Read preference mode: 'primary', 'primaryPreferred', 
   *                                  'secondary', 'secondaryPreferred', 'nearest'
   * @returns {Promise<Array>} Array of documents
   * 
   * Requirements: 11.1, 11.2
   * 
   * @example
   * // Read from secondary for reporting (eventual consistency acceptable)
   * const patients = await patientRepo.findWithReadPreference(
   *   { status: 'active' },
   *   null,
   *   { limit: 100 },
   *   'secondaryPreferred'
   * );
   * 
   * @example
   * // Read from primary for critical data (strong consistency required)
   * const patient = await patientRepo.findWithReadPreference(
   *   { _id: patientId },
   *   null,
   *   {},
   *   'primary'
   * );
   */
  async findWithReadPreference(filter = {}, projection = null, options = {}, readPreference = 'primary') {
    const mongoose = require('mongoose');
    
    // Validate read preference
    const validPreferences = ['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'];
    if (!validPreferences.includes(readPreference)) {
      throw new Error(
        `Invalid read preference: ${readPreference}. Valid options: ${validPreferences.join(', ')}`
      );
    }

    // Check if we can safely read from secondary
    if (readPreference.includes('secondary')) {
      const canRead = await this.canReadFromSecondary();
      if (!canRead) {
        const logger = require('../utils/logger');
        logger.warn({
          readPreference,
          model: this.model.modelName
        }, 'Replication lag too high, falling back to primary for read operation');
        readPreference = 'primary';
      }
    }

    // Build query with pagination
    const page = options.page ? Math.max(1, Number(options.page)) : 1;
    const limit = options.limit ? Math.min(Number(options.limit), 1000) : (options.limit || 20);
    const skip = options.skip || (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    // Create query with read preference
    const query = this.model
      .find(filter, projection)
      .skip(skip)
      .limit(Number(limit))
      .sort(sort)
      .read(readPreference);

    if (options.lean !== false) {
      query.lean();
    }

    return query.exec();
  }

  /**
   * Update a document with a specific write concern
   * 
   * This method allows controlling the acknowledgment requirements for write operations.
   * Use higher write concerns (majority) for critical data that requires durability.
   * 
   * @param {string|ObjectId} id - Document ID
   * @param {Object} update - Update operations to apply
   * @param {Object} options - Update options
   * @param {string} writeConcern - Write concern level: 'majority', 'acknowledged', 'unacknowledged'
   * @returns {Promise<Document>} Updated document
   * 
   * Requirements: 11.3
   * 
   * @example
   * // Critical update requiring majority acknowledgment
   * const updated = await patientRepo.updateWithWriteConcern(
   *   patientId,
   *   { $set: { diagnosis: 'Critical condition' } },
   *   {},
   *   'majority'
   * );
   * 
   * @example
   * // Standard update with acknowledged write concern
   * const updated = await patientRepo.updateWithWriteConcern(
   *   patientId,
   *   { $set: { lastVisit: new Date() } },
   *   {},
   *   'acknowledged'
   * );
   */
  async updateWithWriteConcern(id, update, options = {}, writeConcern = 'majority') {
    const replicationConfig = require('../database/replication-config');
    
    // Validate and get write concern configuration
    let writeConcernConfig;
    try {
      writeConcernConfig = replicationConfig.getWriteConcern(writeConcern);
    } catch (err) {
      throw new Error(err.message);
    }

    // Apply write concern to options
    const updateOptions = {
      new: true,
      w: writeConcernConfig.w,
      j: writeConcernConfig.j,
      wtimeout: writeConcernConfig.wtimeout,
      ...options
    };

    return this.model.findByIdAndUpdate(id, update, updateOptions).exec();
  }

  /**
   * Perform bulk write operations with a specific write concern
   * 
   * This method allows batch operations with controlled write acknowledgment.
   * Useful for importing data or performing batch updates with durability guarantees.
   * 
   * @param {Array} operations - Array of bulk write operations
   * @param {string} writeConcern - Write concern level: 'majority', 'acknowledged', 'unacknowledged'
   * @param {Object} options - Additional bulk write options
   * @returns {Promise<Object>} Bulk write result
   * 
   * Requirements: 11.4
   * 
   * @example
   * // Bulk update with majority write concern
   * const operations = [
   *   { updateOne: { filter: { _id: id1 }, update: { $set: { status: 'active' } } } },
   *   { updateOne: { filter: { _id: id2 }, update: { $set: { status: 'inactive' } } } }
   * ];
   * 
   * const result = await patientRepo.bulkWriteWithConcern(
   *   operations,
   *   'majority'
   * );
   */
  async bulkWriteWithConcern(operations, writeConcern = 'majority', options = {}) {
    const replicationConfig = require('../database/replication-config');
    
    // Validate and get write concern configuration
    let writeConcernConfig;
    try {
      writeConcernConfig = replicationConfig.getWriteConcern(writeConcern);
    } catch (err) {
      throw new Error(err.message);
    }

    // Apply write concern to options
    const bulkOptions = {
      ordered: options.ordered !== false, // Default to ordered operations
      w: writeConcernConfig.w,
      j: writeConcernConfig.j,
      wtimeout: writeConcernConfig.wtimeout,
      ...options
    };

    return this.model.bulkWrite(operations, bulkOptions);
  }

  /**
   * Check if it's safe to read from secondary nodes based on replication lag
   * 
   * This method checks the current replication lag and determines if reading from
   * secondary nodes would provide sufficiently up-to-date data. If lag is too high,
   * reads should be directed to the primary.
   * 
   * @param {number} maxLagMs - Maximum acceptable replication lag in milliseconds (default: 10000)
   * @returns {Promise<boolean>} True if safe to read from secondary, false otherwise
   * 
   * Requirements: 11.5
   * 
   * @example
   * // Check if we can read from secondary
   * const canUseSecondary = await patientRepo.canReadFromSecondary(5000);
   * 
   * if (canUseSecondary) {
   *   // Use secondary for read
   *   const patients = await patientRepo.findWithReadPreference(
   *     filter, null, {}, 'secondaryPreferred'
   *   );
   * } else {
   *   // Use primary for read
   *   const patients = await patientRepo.find(filter);
   * }
   */
  async canReadFromSecondary(maxLagMs = 10000) {
    try {
      const replicaHealthService = require('../services/replica-health.service');
      
      // Get current health status
      const healthStatus = await replicaHealthService.checkHealth();
      
      // If not a replica set, always read from primary
      if (!healthStatus.isReplicaSet) {
        return false;
      }
      
      // If replica set is unhealthy, read from primary
      if (!healthStatus.healthy) {
        return false;
      }
      
      // Check replication lag
      if (healthStatus.replicationLag && healthStatus.replicationLag.maxLagMs !== undefined) {
        return healthStatus.replicationLag.maxLagMs <= maxLagMs;
      }
      
      // If we can't determine lag, be conservative and read from primary
      return false;
    } catch (err) {
      const logger = require('../utils/logger');
      logger.error({ err }, 'Error checking replication lag, defaulting to primary reads');
      
      // On error, be conservative and read from primary
      return false;
    }
  }
}

module.exports = BaseRepository;
