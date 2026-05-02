const { body, param, query, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const PatientsService = require('../services/patients.service');
const auth = require('../middleware/auth.middleware');

exports.create = [
  auth(['Admin','Receptionist']),
  body('name').isString().notEmpty(),
  body('primaryDoctor').isMongoId().withMessage('Primary doctor is required and must be a valid doctor ID'),
  asyncHandler(async (req, res) => {
    const p = await PatientsService.create(req.body, req.user && req.user.id);
    res.status(201).json(p);
  })
];

exports.list = [
  auth(['Admin','Doctor','Nurse','Receptionist']),
  query('q').optional().isString(),
  query('page').optional().isInt({ min:1 }),
  asyncHandler(async (req, res) => {
    const data = await PatientsService.list({ q: req.query.q, page: req.query.page, limit: req.query.limit });
    res.json(data);
  })
];

exports.get = [
  auth(['Admin','Doctor','Nurse','Receptionist','Patient']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const p = await PatientsService.get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  })
];

exports.update = [
  auth(['Admin','Receptionist']),
  param('id').isMongoId(),
  body('primaryDoctor').optional().isMongoId().withMessage('Primary doctor must be a valid doctor ID'),
  asyncHandler(async (req, res) => {
    const u = await PatientsService.update(req.params.id, req.body);
    res.json(u);
  })
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await PatientsService.remove(req.params.id);
    res.json({ ok: true });
  })
];
