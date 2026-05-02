/**
 * Retry helper utility for handling database conflicts with exponential backoff
 * Provides automatic retry logic for version conflicts and lock conflicts
 */

const logger = require('./logger');
const { VersionConflictError, LockConflictError } = require('../errors/database.errors');

/**
 * Default configuration for retry logic
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitterFactor: 0.1
};

/**
 * Calculate delay with exponential backoff and jitter
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {Object} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(attempt, config) {
  const { initialDelayMs, maxDelayMs, backoffMultiplier, jitterFactor } = config;
  
  // Calculate exponential backoff: initialDelay * (multiplier ^ attempt)
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
  
  // Cap at maximum delay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  
  // Add jitter to prevent thundering herd problem
  // Jitter is a random value between -jitterFactor and +jitterFactor of the delay
  const jitter = cappedDelay * jitterFactor * (Math.random() * 2 - 1);
  
  return Math.max(0, Math.round(cappedDelay + jitter));
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error is retryable
 */
function isRetryableError(error) {
  return error instanceof VersionConflictError || error instanceof LockConflictError;
}

/**
 * Retry a function on conflict errors with exponential backoff
 * 
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry configuration options
 * @param {number} [options.maxRetries=3] - Maximum number of retry attempts
 * @param {number} [options.initialDelayMs=100] - Initial delay in milliseconds
 * @param {number} [options.maxDelayMs=5000] - Maximum delay in milliseconds
 * @param {number} [options.backoffMultiplier=2] - Multiplier for exponential backoff
 * @param {number} [options.jitterFactor=0.1] - Jitter factor (0-1) to add randomness
 * @param {Function} [options.onRetry] - Callback function called before each retry
 * @param {string} [options.operationName] - Name of the operation for logging
 * @returns {Promise<*>} Result of the function
 * @throws {Error} The last error if all retries are exhausted
 * 
 * @example
 * const result = await retryOnConflict(
 *   async () => await repository.optimisticUpdate(id, version, update),
 *   { maxRetries: 5, operationName: 'updatePatient' }
 * );
 */
async function retryOnConflict(fn, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const { maxRetries, onRetry, operationName = 'operation' } = config;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Execute the function
      const result = await fn();
      
      // Log success if this was a retry
      if (attempt > 0) {
        logger.info({
          operation: operationName,
          attempt: attempt + 1,
          totalAttempts: maxRetries + 1
        }, `${operationName} succeeded after ${attempt} retries`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        // Non-retryable error, throw immediately
        logger.debug({
          operation: operationName,
          errorType: error.name,
          attempt: attempt + 1
        }, `${operationName} failed with non-retryable error`);
        throw error;
      }
      
      // Check if we have retries left
      if (attempt >= maxRetries) {
        // No more retries, throw the error
        logger.warn({
          operation: operationName,
          errorType: error.name,
          totalAttempts: attempt + 1,
          maxRetries
        }, `${operationName} failed after ${attempt + 1} attempts`);
        throw error;
      }
      
      // Calculate delay for next retry
      const delay = calculateDelay(attempt, config);
      
      // Log retry attempt
      logger.info({
        operation: operationName,
        errorType: error.name,
        attempt: attempt + 1,
        nextRetryIn: delay,
        currentVersion: error.currentVersion,
        lockInfo: error.lockInfo
      }, `${operationName} conflict detected, retrying in ${delay}ms`);
      
      // Call onRetry callback if provided
      if (onRetry) {
        try {
          await onRetry(error, attempt, delay);
        } catch (callbackError) {
          logger.error({
            operation: operationName,
            error: callbackError.message
          }, 'Error in onRetry callback');
        }
      }
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  // This should never be reached, but just in case
  throw lastError;
}

/**
 * Create a retry wrapper function with pre-configured options
 * Useful for creating reusable retry functions with specific configurations
 * 
 * @param {Object} options - Retry configuration options (same as retryOnConflict)
 * @returns {Function} A function that wraps any async function with retry logic
 * 
 * @example
 * const retryWithDefaults = createRetryWrapper({ maxRetries: 5, initialDelayMs: 200 });
 * const result = await retryWithDefaults(async () => await someOperation());
 */
function createRetryWrapper(options = {}) {
  return function(fn) {
    return retryOnConflict(fn, options);
  };
}

module.exports = {
  retryOnConflict,
  createRetryWrapper,
  isRetryableError,
  calculateDelay,
  DEFAULT_CONFIG
};
