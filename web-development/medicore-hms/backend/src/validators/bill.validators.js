const { body } = require('express-validator');

exports.createBillValidators = [
  body('patient').isMongoId(),
  body('items').isArray({ min: 1 }),
  body('items.*.itemCode').isString().notEmpty(),
  body('items.*.qty').isInt({ min: 1 }),
  body('items.*.unitPrice').isFloat({ min: 0 }),
  body('adjustInventory').optional().isBoolean()
];

exports.payBillValidators = [
  body('payment.amount').isFloat({ min: 0 }),
  body('payment.method').isString().isIn(['Cash','Card','Online'])
];