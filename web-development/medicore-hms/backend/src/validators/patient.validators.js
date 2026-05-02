const { body } = require('express-validator');

exports.createPatientValidators = [
  body('name').isString().notEmpty(),
  body('dob').optional().isISO8601(),
  body('gender').optional().isIn(['Male','Female','Other']),
  body('contact.phone').optional().isMobilePhone('any'),
  body('contact.email').optional().isEmail(),
  body('address').optional().isString(),
  body('primaryDoctor').isMongoId().withMessage('Primary doctor is required'),
];

exports.updatePatientValidators = [
  body('name').optional().isString(),
  body('contact.phone').optional().isMobilePhone('any'),
  body('contact.email').optional().isEmail(),
  body('primaryDoctor').optional().isMongoId(),
];