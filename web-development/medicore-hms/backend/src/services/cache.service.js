/**
 * cache.service.js
 * 
 * Redis caching service for performance optimization
 */

const { getRedisClient } = require('../database/redis-connection');
const logger = require('../utils/logger');

class CacheService {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    try {
      const client = getRedisClient();
      if (!client) return null;
      
      const value = await client.get(key);
      if (!value) return null;
      
      return JSON.parse(value);
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = 3600) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      
      await client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Key pattern (e.g., 'user:*')
   * @returns {Promise<boolean>} - Success status
   */
  async delPattern(pattern) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Exists status
   */
  async exists(key) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - get from cache or execute function and cache result
   * @param {string} key - Cache key
   * @param {Function} fn - Function to execute if cache miss
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} - Cached or fresh value
   */
  async getOrSet(key, fn, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        logger.debug(`Cache hit for key: ${key}`);
        return cached;
      }
      
      // Cache miss - execute function
      logger.debug(`Cache miss for key: ${key}`);
      const value = await fn();
      
      // Cache the result
      await this.set(key, value, ttl);
      
      return value;
    } catch (error) {
      logger.error(`Cache getOrSet error for key ${key}:`, error);
      // On error, just execute the function
      return await fn();
    }
  }

  /**
   * Increment counter
   * @param {string} key - Cache key
   * @param {number} amount - Amount to increment (default: 1)
   * @returns {Promise<number>} - New value
   */
  async incr(key, amount = 1) {
    try {
      const client = getRedisClient();
      if (!client) return 0;
      
      return await client.incrBy(key, amount);
    } catch (error) {
      logger.error(`Cache incr error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set expiry on existing key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async expire(key, ttl) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      
      await client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} - Success status
   */
  async flush() {
    try {
      const client = getRedisClient();
      if (!client) return false;
      
      await client.flushDb();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Generate cache key for departments
   */
  departmentsKey() {
    return 'departments:all';
  }

  /**
   * Generate cache key for doctors by department
   */
  doctorsByDepartmentKey(departmentId) {
    return `doctors:department:${departmentId}`;
  }

  /**
   * Generate cache key for medicines
   */
  medicinesKey() {
    return 'medicines:all';
  }

  /**
   * Generate cache key for lab tests
   */
  labTestsKey() {
    return 'lab-tests:all';
  }

  /**
   * Generate cache key for rooms by type
   */
  roomsByTypeKey(roomType) {
    return `rooms:type:${roomType}`;
  }

  /**
   * Generate cache key for user session
   */
  userSessionKey(userId) {
    return `session:user:${userId}`;
  }
}

module.exports = new CacheService();
