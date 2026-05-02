/**
 * input-validation.middleware.js
 * 
 * Enhanced input validation and sanitization
 */

const validator = require('validator');
const logger = require('../utils/logger');

/**
 * Sanitize string inputs to prevent XSS
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Escape HTML entities
  let sanitized = validator.escape(str);
  
  // Remove any script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return sanitized;
};

/**
 * Recursively sanitize object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate phone number (basic)
 */
const validatePhone = (phone) => {
  return validator.isMobilePhone(phone, 'any');
};

/**
 * Validate URL
 */
const validateUrl = (url) => {
  return validator.isURL(url);
};

/**
 * Middleware to sanitize all inputs
 */
const sanitizeInputs = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    logger.error('Error sanitizing inputs:', error);
    next(error);
  }
};

module.exports = {
  sanitizeInputs,
  sanitizeString,
  sanitizeObject,
  validateEmail,
  validatePhone,
  validateUrl
};
