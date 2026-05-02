const { body } = require('express-validator');

exports.createRoomValidators = [
  body('number').isString().notEmpty(),
  body('type').isIn(['General','Private','ICU','Operation']),
  body('department').optional().isMongoId()
];

exports.updateRoomValidators = [
  body('type').optional().isIn(['General','Private','ICU','Operation']),
  body('status').optional().isIn(['Available','Occupied'])
];