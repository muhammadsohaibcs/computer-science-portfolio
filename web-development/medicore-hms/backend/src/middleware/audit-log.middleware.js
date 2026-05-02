/**
 * audit-log.middleware.js
 * 
 * Audit logging middleware for tracking user actions
 * Logs significant operations for security and compliance
 */

const logger = require('../utils/logger');

/**
 * Actions that should be audited
 */
const AUDITABLE_ACTIONS = {
  POST: ['create', 'register', 'login'],
  PUT: ['update', 'modify'],
  PATCH: ['update', 'modify'],
  DELETE: ['delete', 'remove']
};

/**
 * Sensitive paths that should always be audited
 */
const SENSITIVE_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/change-password',
  '/users',
  '/admin',
  '/bills',
  '/payments'
];

/**
 * Check if request should be audited
 */
const shouldAudit = (req) => {
  // Audit all write operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return true;
  }
  
  // Audit sensitive paths
  if (SENSITIVE_PATHS.some(path => req.path.includes(path))) {
    return true;
  }
  
  return false;
};

/**
 * Extract entity information from request
 */
const extractEntityInfo = (req) => {
  const pathParts = req.path.split('/').filter(Boolean);
  
  return {
    entityType: pathParts[0] || 'unknown',
    entityId: req.params.id || req.body.id || null
  };
};

/**
 * Audit log middleware
 */
const auditLog = (req, res, next) => {
  if (!shouldAudit(req)) {
    return next();
  }
  
  const startTime = Date.now();
  const { entityType, entityId } = extractEntityInfo(req);
  
  // Capture original response methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  // Track response
  let responseLogged = false;
  
  const logAudit = (responseData) => {
    if (responseLogged) return;
    responseLogged = true;
    
    const duration = Date.now() - startTime;
    
    // Only log successful operations (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logger.info({
        action: `${req.method} ${req.path}`,
        userId: req.user?.id || 'anonymous',
        userRole: req.user?.role || 'unknown',
        entityType,
        entityId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      }, 'Audit log');
    }
  };
  
  // Override response methods
  res.json = function(data) {
    logAudit(data);
    return originalJson(data);
  };
  
  res.send = function(data) {
    logAudit(data);
    return originalSend(data);
  };
  
  next();
};

module.exports = auditLog;
