const { body } = require('express-validator');

exports.createDoctorValidators = [
  body('name').isString().notEmpty(),
  body('specialization').optional().isArray(),
  body('specialization.*').optional().isString(),
  body('department').optional().isMongoId(),
  body('experienceYears').optional().isInt({ min: 0 })
];

exports.updateDoctorValidators = [
  body('name').optional().isString(),
  body('specialization').optional().isArray(),
  body('specialization.*').optional().isString(),
  body('experienceYears').optional().isInt({ min: 0 })
];