const { body } = require('express-validator');

exports.createPrescriptionValidators = [
  body('patient').isMongoId(),
  body('drugs').isArray({ min: 1 }),
  body('drugs.*.name').isString().notEmpty(),
  body('drugs.*.dosage').optional().isString()
];

exports.fulfillPrescriptionValidators = [
  body('items').isArray({ min: 1 }),
  body('items.*.itemCode').isString(),
  body('items.*.qty').isInt({ min: 1 })
];