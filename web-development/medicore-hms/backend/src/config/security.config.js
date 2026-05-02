/**
 * security.config.js
 *
 * Security-related configuration used by middleware and auth flows.
 * Keep production secrets in environment variables or a secret manager.
 *
 * This file configures:
 *  - CORS origin for frontend (Lab 01 shows connecting Atlas & frontend)
 *  - Cookie settings for refresh token (HttpOnly, SameSite)
 *  - Rate limiting thresholds (see rate-limit.config.js)
 *  - NoSQL injection sanitization options (disallow operator keys)
 *
 * References in lab manual:
 * - Views & DB-level access control (Lab 13) — use DB views for additional security when needed.
 * - NoSQL injection lab (Lab 14) — sanitize on server side.
 */

module.exports = {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  cookie: {
    name: process.env.REFRESH_COOKIE_NAME || 'hms_refresh',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',               // Strict reduces CSRF risk
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    path: '/api/auth/refresh'
  },

  // NoSQL injection sanitization policy used by sanitize middleware
  sanitize: {
    // blacklist keys that start with '$' or contain '.' — Lab 14 demonstrates these attacks.
    rejectDollarKeys: true,
    rejectDotKeys: true,
    // If true, log rejected keys for auditing (do not log sensitive payload). See SECURITY.md.
    auditRejected: true
  },

  // Application-level role design (primary roles). Use this as canonical list across app.
  roles: ['Admin', 'HOD', 'Doctor', 'Nurse', 'Receptionist', 'Patient', 'Lab Technician', 'Pharmacist'],
  
  // Password policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAttempts: 5,
    lockoutDuration: 900000 // 15 minutes in milliseconds
  },
  
  // Session configuration
  session: {
    maxConcurrentSessions: 3,
    sessionTimeout: 3600000, // 1 hour in milliseconds
    refreshTokenRotation: true
  },
  
  // File upload security
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    minImageDimensions: { width: 200, height: 200 }
  },
  
  // Encryption settings
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64
  },

  // DB-level views configuration (optional): examples to create role-filtered views in Atlas
  // See Lab 13: Views, Materialized Views, DB Security (Access Control). Example: create view 'patients_view'
  // Enable via ENABLE_DB_VIEWS environment variable
  dbViews: {
    enabled: process.env.ENABLE_DB_VIEWS === 'true',
    // Example pipeline can be used to create a secured view where $USER_ROLES is referenced
    example: {
      name: 'patients_view',
      source: 'patients',
      pipeline: [
        { $match: { /* placeholder: filter by roles or fields */ } },
        { $project: { name: 1, contact: 1, createdBy: 1 } }
      ]
    }
  }
};
