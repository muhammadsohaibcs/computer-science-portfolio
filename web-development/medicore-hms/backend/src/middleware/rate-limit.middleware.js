/**
 * rate-limit.middleware.js
 *
 * Implements rate limiting using the global and auth rate configs.
 *
 * Lab Manual Mapping:
 * - Rate limiting complements Lab 07/08 performance monitoring in Atlas.
 */

const rateLimit = require('express-rate-limit');
const rateConf = require('../config/rate-limit.config');

module.exports.globalLimiter = rateLimit(rateConf.globalLimit);
module.exports.authLimiter = rateLimit(rateConf.authLimit);
