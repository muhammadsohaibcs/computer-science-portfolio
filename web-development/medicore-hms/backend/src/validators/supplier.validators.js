const { body } = require('express-validator');

exports.createSupplierValidators = [
  body('name').isString().notEmpty(),
  body('contact.email').optional().isEmail(),
  body('contact.phone').optional().isMobilePhone()
];

exports.addSuppliedItemValidators = [
  body('itemCode').isString().notEmpty()
];