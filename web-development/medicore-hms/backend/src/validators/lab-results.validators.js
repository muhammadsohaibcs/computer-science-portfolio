const { body } = require('express-validator');

exports.createLabResultValidators = [
  body('patient').isMongoId(),
  body('testName').isString().notEmpty(),
  body('result').optional().isString(),
  body('units').optional().isString()
];

exports.addAttachmentValidators = [
  body('filename').isString(),
  body('url').isURL()
];