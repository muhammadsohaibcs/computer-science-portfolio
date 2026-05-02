const { body } = require('express-validator');

exports.createServiceValidators = [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('price').optional().isFloat({ min: 0 })
];