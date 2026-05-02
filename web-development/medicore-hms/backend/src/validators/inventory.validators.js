const { body } = require('express-validator');

exports.addInventoryValidators = [
  body('itemCode').isString().notEmpty(),
  body('name').isString().notEmpty(),
  body('quantity').isInt({ min: 0 }),
  body('reorderThreshold').optional().isInt({ min: 0 })
];

exports.adjustInventoryValidators = [
  body('updates').isArray({ min: 1 }),
  body('updates.*.itemCode').isString(),
  body('updates.*.qtyDelta').isInt()
];

exports.decrementInventoryValidators = [
  body('itemCode').isString(),
  body('qty').isInt({ min: 1 })
];