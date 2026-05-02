/**
 * validation.middleware.js
 *
 * Applies validation schemas using express-validator.
 *
 * Lab Manual Mapping:
 * - Lab 14 (NoSQL Injection & Input Validation): Emphasizes strict server-side validation.
 */

const { validationResult } = require('express-validator');

module.exports = function validate(schema) {
  return async (req, res, next) => {
    await Promise.all(schema.map((rule) => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    next();
  };
};
