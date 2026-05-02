/**
 * Transaction Helper
 * 
 * Provides a wrapper for MongoDB transactions that gracefully falls back
 * to non-transactional operations when replica set is not available.
 */

const mongoose = require('mongoose');
const appConfig = require('../config/app.config');
const logger = require('./logger');

/**
 * Execute operations with transaction support if available,
 * otherwise execute without transaction
 * 
 * @param {Function} callback - Async function to execute (receives session or null)
 * @returns {Promise<any>} - Result from callback
 */
async function withOptionalTransaction(callback) {
  // Check if transactions are enabled and supported
  if (!appConfig.features.enableTransactions) {
    // Execute without transaction
    logger.debug('Transactions disabled, executing without session');
    return await callback(null);
  }

  // Try to use transaction
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    session.endSession();
    return result;
  } catch (err) {
    session.endSession();
    
    // If error is about transactions not being supported, disable them and retry
    if (err.message && err.message.includes('Transaction numbers are only allowed')) {
      logger.warn('Transactions not supported, disabling and retrying without transaction');
      appConfig.features.enableTransactions = false;
      return await callback(null);
    }
    
    throw err;
  }
}

module.exports = {
  withOptionalTransaction
};
