/**
 * auth.middleware.js
 *
 * This middleware verifies the Access Token (JWT).
 * It does NOT handle refresh tokens — only auth.controller handles that.
 *
 * Lab Manual Mapping:
 * - Lab 10 (Transactions): Authentication must be validated BEFORE starting sessions.
 * - Lab 13 (DB Security): Role-level access control is part of database access best practices.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/app.config');

module.exports = function authMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ error: 'Missing or invalid authorization header' });

    const token = header.replace('Bearer ', '');

    try {
      const payload = jwt.verify(token, config.jwt.accessSecret);

      req.user = {
        id: payload.sub,
        role: payload.role
      };

      // Role-checking (RBAC)
      if (allowedRoles.length && !allowedRoles.includes(payload.role))
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

