const { body, param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const PrescriptionsService = require('../services/prescriptions.service');
const auth = require('../middleware/auth.middleware');

exports.list = [
  auth(['Doctor', 'Pharmacist', 'Nurse', 'Admin']),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 }
    };

    if (search) {
      options.search = search;
    }

    const result = await PrescriptionsService.list(options);
    res.json(result);
  })
];

exports.create = [
  auth(['Doctor', 'Admin']),
  body('patient').isMongoId(),
  body('doctor').isMongoId(),
  body('drugs').isArray({ min: 1 }),
  asyncHandler(async (req, res) => {
    const payload = {
      patient: req.body.patient,
      doctor: req.body.doctor,
      drugs: req.body.drugs,
      notes: req.body.notes
    };
    const created = await PrescriptionsService.create(payload);
    res.status(201).json({ data: created });
  })
];

exports.listByPatient = [
  auth(['Admin','Doctor','Pharmacist','Nurse','Patient']),
  param('patientId').isMongoId(),
  asyncHandler(async (req, res) => res.json(await PrescriptionsService.listByPatient(req.params.patientId, { limit: req.query.limit || 50 })))
];

exports.fulfill = [
  auth(['Pharmacist']),
  param('id').isMongoId(),
  body('items').isArray({ min: 1 }),
  asyncHandler(async (req, res) => {
    const fulfilled = await PrescriptionsService.fulfill(req.params.id, req.body.items, req.user.id || req.user.sub);
    res.json(fulfilled);
  })
];

exports.get = [
  auth(['Doctor','Pharmacist','Patient', 'Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const p = await PrescriptionsService.get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({ data: p });
  })
];

exports.update = [
  auth(['Doctor', 'Admin']),
  param('id').isMongoId(),
  body('patient').optional().isMongoId(),
  body('doctor').optional().isMongoId(),
  body('drugs').optional().isArray({ min: 1 }),
  asyncHandler(async (req, res) => {
    const updated = await PrescriptionsService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ data: updated });
  })
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => { 
    await PrescriptionsService.remove(req.params.id); 
    res.json({ message: 'Prescription deleted successfully' }); 
  })
];
