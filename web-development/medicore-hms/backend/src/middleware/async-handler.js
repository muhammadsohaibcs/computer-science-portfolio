/**
 * async-handler.js
 *
 * Wrap async controllers to catch promise rejections automatically.
 *
 * Lab Manual Mapping:
 * - Ensures clean transactional flow (Lab 10) by routing errors properly.
 */

module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
