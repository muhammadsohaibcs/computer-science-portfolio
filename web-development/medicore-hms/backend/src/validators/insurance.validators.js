const { body } = require('express-validator');

exports.createInsuranceValidators = [
  body('providerName').isString().notEmpty(),
  body('policyNumber').isString().notEmpty(),
  body('validFrom').optional().isISO8601(),
  body('validTo').optional().isISO8601(),
  body('patient').isMongoId()
];

exports.validatePolicyValidators = [
  body('providerName').isString().notEmpty(),
  body('policyNumber').isString().notEmpty()
];