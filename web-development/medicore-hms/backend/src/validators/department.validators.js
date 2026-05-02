const { body } = require('express-validator');

exports.createDepartmentValidators = [
  body('name').isString().notEmpty(),
  body('code').optional().isString().isLength({ min: 2 })
];

exports.updateDepartmentValidators = [
  body('name').optional().isString(),
  body('code').optional().isString()
];