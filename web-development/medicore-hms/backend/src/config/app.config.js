/**
 * app.config.js
 *
 * Centralized application-level configuration.
 *
 * Notes:
 * - Keep secrets (JWT secrets, DB URI) in environment variables (see .env.example).
 * - This file centralizes defaults so controllers/services can import from one place.
 * - See Lab 01 (Atlas setup) for connecting app to Atlas and Lab 10 for transaction requirements. :contentReference[oaicite:1]{index=1}
 */

module.exports = {
  appName: 'Hospital Management System',
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  env: process.env.NODE_ENV || 'development',

  // JWT and auth: short-lived access + rotating refresh tokens
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change_this_in_prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_this_in_prod',
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '10m',          // short lived per security guidance
    refreshExpiryDays: process.env.REFRESH_TOKEN_EXPIRY_DAYS ? Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) : 30
  },

  // Defaults for pagination (used by many list endpoints)
  pagination: {
    defaultLimit: 20,
    maxLimit: 200
  },

  // Monitoring / observability
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // Feature flags (toggle labs/testing features)
  features: {
    enableTransactions: true, // set false to disable multi-doc transactions during dev w/out replica
    enableReplicaChecks: true // if true app will verify replica set when attempting transactions
  }
};
