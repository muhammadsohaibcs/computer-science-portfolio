/**
 * rate-limit.config.js
 *
 * Centralized rate-limit configuration to protect endpoints from abuse.
 * The lab manual emphasizes testing and monitoring (Atlas monitoring, alerts) — use rate limits
 * together with monitoring to detect suspicious behavior (see Lab 07/08 notes on monitoring). :contentReference[oaicite:10]{index=10}
 *
 * We define:
 *  - globalLimit: general API throttle
 *  - authLimit: stricter throttle for login/register endpoints
 */

module.exports = {
  globalLimit: {
    windowMs: (process.env.RATE_WINDOW_MS ? Number(process.env.RATE_WINDOW_MS) : 15 * 60 * 1000),
    max: (process.env.RATE_MAX || 500),
    standardHeaders: true,
    legacyHeaders: false
  },

  authLimit: {
    // Very strict for login endpoints to mitigate brute-force attacks
    windowMs: (process.env.AUTH_RATE_WINDOW_MS ? Number(process.env.AUTH_RATE_WINDOW_MS) : 15 * 60 * 1000),
    max: (process.env.AUTH_RATE_MAX ? Number(process.env.AUTH_RATE_MAX) : 5),
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }
};

