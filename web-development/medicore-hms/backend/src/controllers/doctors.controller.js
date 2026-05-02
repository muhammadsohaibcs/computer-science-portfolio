const { param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const DoctorsService = require('../services/doctors.service');
const auth = require('../middleware/auth.middleware');
const { createDoctorValidators, updateDoctorValidators } = require('../validators/doctor.validators');
const validate = require('../middleware/validation.middleware');

exports.create = [
  auth(['Admin']),
  ...createDoctorValidators,
  validate(createDoctorValidators),
  asyncHandler(async (req, res) => res.status(201).json(await DoctorsService.create(req.body)))
];

exports.list = [
  auth(['Admin','Doctor','Receptionist']),
  query('specialization').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  asyncHandler(async (req, res) => res.json(await DoctorsService.list({ 
    specialization: req.query.specialization, 
    q: req.query.q,
    page: req.query.page,
    limit: req.query.limit
  })))
];

exports.get = [
  auth(['Admin','Doctor','Nurse','Receptionist']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const d = await DoctorsService.get(req.params.id);
    if (!d) return res.status(404).json({ error: 'Not found' });
    res.json(d);
  })
];

exports.update = [
  auth(['Admin']),
  param('id').isMongoId(),
  ...updateDoctorValidators,
  validate(updateDoctorValidators),
  asyncHandler(async (req, res) => res.json(await DoctorsService.update(req.params.id, req.body)))
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => { await DoctorsService.update(req.params.id, { deleted: true }); res.json({ ok: true }); })
];
