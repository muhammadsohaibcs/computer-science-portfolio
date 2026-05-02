const { body } = require('express-validator');

exports.createStaffValidators = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('roleTitle').optional().isString(),
  body('department').optional().isMongoId().withMessage('Department must be a valid ObjectId')
];

exports.updateStaffValidators = [
  body('name').optional().isString(),
  body('roleTitle').optional().isString(),
  body('department').optional().isMongoId().withMessage('Department must be a valid ObjectId')
];