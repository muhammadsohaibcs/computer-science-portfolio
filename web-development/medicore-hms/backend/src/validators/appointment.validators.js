const { body } = require('express-validator');

exports.createAppointmentValidators = [
  body('patient').isMongoId(),
  body('doctor').isMongoId(),
  body('appointmentDate').isISO8601(),
  body('durationMinutes').optional().isInt({ min: 5, max: 240 }),
  body('notes').optional().isString()
];

exports.updateAppointmentValidators = [
  body('appointmentDate').optional().isISO8601(),
  body('durationMinutes').optional().isInt({ min: 5, max: 240 })
];