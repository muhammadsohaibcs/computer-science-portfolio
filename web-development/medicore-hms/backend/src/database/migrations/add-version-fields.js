/**
 * src/database/migrations/add-version-fields.js
 *
 * Migration script to add __v: 0 to all existing documents in critical collections
 * that use optimistic locking.
 *
 * Critical collections:
 * - patients
 * - appointments
 * - inventory
 * - bills
 *
 * Requirements: 1.1
 *
 * Usage:
 *   node backend/src/database/migrations/add-version-fields.js up
 *   node backend/src/database/migrations/add-version-fields.js down
 */

'use strict';

const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const dbConfig = require('../../config/db.config');

// Critical collections that need version fields
const CRITICAL_COLLECTIONS = [
  'patients',
  'appointments',
  'inventories',
  'bills'
];

/**
 * Connect to MongoDB
 */
async function connect() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options || {});
    logger.info({ uri: dbConfig.uri }, 'Migration: Connected to MongoDB');
    return true;
  } catch (err) {
    logger.error({ err }, 'Migration: Failed to connect to MongoDB');
    throw err;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnect() {
  try {
    await mongoose.connection.close();
    logger.info('Migration: Disconnected from MongoDB');
  } catch (err) {
    logger.error({ err }, 'Migration: Error disconnecting from MongoDB');
    throw err;
  }
}

/**
 * Add version field to documents that don't have it
 * 
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Object>} - Migration result with counts
 */
async function addVersionField(collectionName) {
  const collection = mongoose.connection.collection(collectionName);
  
  try {
    // Find documents without __v field
    const documentsWithoutVersion = await collection.countDocuments({ __v: { $exists: false } });
    
    if (documentsWithoutVersion === 0) {
      logger.info({ collection: collectionName }, 'Migration: No documents need version field');
      return {
        collection: collectionName,
        modified: 0,
        skipped: 0,
        total: 0
      };
    }
    
    logger.info({ 
      collection: collectionName, 
      count: documentsWithoutVersion 
    }, 'Migration: Adding version field to documents');
    
    // Update all documents without __v field, set it to 0
    const result = await collection.updateMany(
      { __v: { $exists: false } },
      { $set: { __v: 0 } }
    );
    
    logger.info({
      collection: collectionName,
      matched: result.matchedCount,
      modified: result.modifiedCount
    }, 'Migration: Version field added successfully');
    
    return {
      collection: collectionName,
      modified: result.modifiedCount,
      matched: result.matchedCount,
      total: documentsWithoutVersion
    };
  } catch (err) {
    logger.error({ 
      err, 
      collection: collectionName 
    }, 'Migration: Error adding version field');
    throw err;
  }
}

/**
 * Remove version field from documents (rollback)
 * 
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Object>} - Rollback result with counts
 */
async function removeVersionField(collectionName) {
  const collection = mongoose.connection.collection(collectionName);
  
  try {
    // Find documents with __v field
    const documentsWithVersion = await collection.countDocuments({ __v: { $exists: true } });
    
    if (documentsWithVersion === 0) {
      logger.info({ collection: collectionName }, 'Rollback: No documents have version field');
      return {
        collection: collectionName,
        modified: 0,
        total: 0
      };
    }
    
    logger.info({ 
      collection: collectionName, 
      count: documentsWithVersion 
    }, 'Rollback: Removing version field from documents');
    
    // Remove __v field from all documents
    const result = await collection.updateMany(
      { __v: { $exists: true } },
      { $unset: { __v: '' } }
    );
    
    logger.info({
      collection: collectionName,
      matched: result.matchedCount,
      modified: result.modifiedCount
    }, 'Rollback: Version field removed successfully');
    
    return {
      collection: collectionName,
      modified: result.modifiedCount,
      matched: result.matchedCount,
      total: documentsWithVersion
    };
  } catch (err) {
    logger.error({ 
      err, 
      collection: collectionName 
    }, 'Rollback: Error removing version field');
    throw err;
  }
}

/**
 * Run migration (add version fields)
 */
async function up() {
  logger.info('Migration: Starting version field migration (UP)');
  
  const results = [];
  let totalModified = 0;
  let totalErrors = 0;
  
  for (const collectionName of CRITICAL_COLLECTIONS) {
    try {
      const result = await addVersionField(collectionName);
      results.push(result);
      totalModified += result.modified;
    } catch (err) {
      totalErrors++;
      results.push({
        collection: collectionName,
        error: err.message,
        modified: 0
      });
    }
  }
  
  // Summary
  logger.info({
    totalCollections: CRITICAL_COLLECTIONS.length,
    totalModified,
    totalErrors,
    results
  }, 'Migration: Version field migration completed (UP)');
  
  console.log('\n=== Migration Summary (UP) ===');
  console.log(`Total collections processed: ${CRITICAL_COLLECTIONS.length}`);
  console.log(`Total documents modified: ${totalModified}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log('\nDetails:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  - ${r.collection}: ERROR - ${r.error}`);
    } else {
      console.log(`  - ${r.collection}: ${r.modified} documents updated`);
    }
  });
  console.log('==============================\n');
  
  return { success: totalErrors === 0, results };
}

/**
 * Rollback migration (remove version fields)
 */
async function down() {
  logger.info('Rollback: Starting version field rollback (DOWN)');
  
  const results = [];
  let totalModified = 0;
  let totalErrors = 0;
  
  for (const collectionName of CRITICAL_COLLECTIONS) {
    try {
      const result = await removeVersionField(collectionName);
      results.push(result);
      totalModified += result.modified;
    } catch (err) {
      totalErrors++;
      results.push({
        collection: collectionName,
        error: err.message,
        modified: 0
      });
    }
  }
  
  // Summary
  logger.info({
    totalCollections: CRITICAL_COLLECTIONS.length,
    totalModified,
    totalErrors,
    results
  }, 'Rollback: Version field rollback completed (DOWN)');
  
  console.log('\n=== Rollback Summary (DOWN) ===');
  console.log(`Total collections processed: ${CRITICAL_COLLECTIONS.length}`);
  console.log(`Total documents modified: ${totalModified}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log('\nDetails:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  - ${r.collection}: ERROR - ${r.error}`);
    } else {
      console.log(`  - ${r.collection}: ${r.modified} documents updated`);
    }
  });
  console.log('===============================\n');
  
  return { success: totalErrors === 0, results };
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];
  
  if (!command || !['up', 'down'].includes(command)) {
    console.error('Usage: node add-version-fields.js [up|down]');
    console.error('  up   - Add __v: 0 to documents without version field');
    console.error('  down - Remove __v field from all documents (rollback)');
    process.exit(1);
  }
  
  try {
    // Connect to database
    await connect();
    
    // Run migration or rollback
    let result;
    if (command === 'up') {
      result = await up();
    } else {
      result = await down();
    }
    
    // Disconnect
    await disconnect();
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (err) {
    logger.error({ err }, 'Migration: Fatal error');
    console.error('Fatal error:', err.message);
    
    try {
      await disconnect();
    } catch (disconnectErr) {
      // Ignore disconnect errors during error handling
    }
    
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export functions for testing
module.exports = {
  connect,
  disconnect,
  addVersionField,
  removeVersionField,
  up,
  down
};
