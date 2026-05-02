const { VersionConflictError } = require('../../errors/database.errors');

/**
 * Mongoose plugin that adds version-based optimistic locking
 * 
 * This plugin ensures data integrity in concurrent update scenarios by:
 * 1. Initializing a version field on document creation
 * 2. Incrementing the version on each update
 * 3. Providing version-aware update methods that prevent lost updates
 * 
 * @param {Object} schema - Mongoose schema to apply plugin to
 * @param {Object} options - Plugin configuration options
 * @param {string} options.versionField - Name of version field (default: '__v')
 */
function optimisticLockingPlugin(schema, options = {}) {
  const versionField = options.versionField || '__v';
  
  // Ensure version field exists in schema
  if (!schema.path(versionField)) {
    schema.add({ 
      [versionField]: { 
        type: Number, 
        default: 0 
      } 
    });
  }
  
  // Pre-save hook to increment version on updates
  schema.pre('save', function(next) {
    // Only increment version for existing documents (not new ones)
    if (!this.isNew) {
      this.increment();
    }
    next();
  });
  
  /**
   * Static method for version-aware updates
   * 
   * Performs an atomic update that only succeeds if the document version
   * matches the expected version. This prevents lost updates in concurrent scenarios.
   * 
   * @param {string|ObjectId} id - Document ID
   * @param {number} version - Expected current version
   * @param {Object} update - Update operations to apply
   * @param {Object} options - Additional options for findOneAndUpdate
   * @returns {Promise<Document>} Updated document
   * @throws {VersionConflictError} If version mismatch occurs
   */
  schema.statics.updateWithVersion = async function(id, version, update, options = {}) {
    // Build filter with both ID and version
    const filter = { 
      _id: id, 
      [versionField]: version 
    };
    
    // Build update document with version increment
    const updateDoc = { 
      ...update, 
      $inc: { [versionField]: 1 } 
    };
    
    // Attempt the update
    const result = await this.findOneAndUpdate(
      filter, 
      updateDoc, 
      { new: true, ...options }
    );
    
    // If no document was updated, check if it exists and get current version
    if (!result) {
      const current = await this.findById(id);
      
      if (!current) {
        // Document doesn't exist
        const error = new Error(`Document with id ${id} not found`);
        error.name = 'DocumentNotFoundError';
        error.statusCode = 404;
        throw error;
      }
      
      // Document exists but version mismatch - throw conflict error
      throw new VersionConflictError(
        `Version conflict: expected ${version}, current is ${current[versionField]}`,
        current[versionField]
      );
    }
    
    return result;
  };
}

module.exports = optimisticLockingPlugin;
