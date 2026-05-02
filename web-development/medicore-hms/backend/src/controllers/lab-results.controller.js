const { body, param, query } = require('express-validator');
const path = require('path');
const asyncHandler = require('../middleware/async-handler');
const { checkPermission } = require('../middleware/permissions.middleware');
const { upload } = require('../middleware/upload.middleware');
const LabResultsRepo = require('../repositories/lab-results.repo');
const LabResultsService = require('../services/lab-results.service');

exports.create = [
  checkPermission('lab:results:manage'),
  body('patient').isMongoId().withMessage('Valid patient ID required'),
  body('testName').isString().notEmpty().withMessage('Test name required'),
  body('result').optional().isString(),
  asyncHandler(async (req, res) => {
    const payload = {
      patient:     req.body.patient,
      testName:    req.body.testName,
      result:      req.body.result,
      normalRange: req.body.normalRange,
      units:       req.body.units,
      status:      req.body.status || 'pending',
      performedBy: req.user.id,
      performedAt: req.body.performedAt || new Date(),
    };
    const created = await LabResultsService.create(payload, req.user.id);
    res.status(201).json(created);
  }),
];

/** POST /api/lab-results/upload — multipart PDF/image upload */
exports.uploadFile = [
  checkPermission('lab:results:manage'),
  upload.single('report'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filename = req.file.originalname;
    const url = `/uploads/${req.file.filename}`;
    res.json({ filename, url, size: req.file.size, mimetype: req.file.mimetype });
  }),
];

exports.addAttachment = [
  checkPermission('lab:results:manage'),
  param('id').isMongoId(),
  body('filename').isString().notEmpty(),
  body('url').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const attachment = { filename: req.body.filename, url: req.body.url };
    const updated = await LabResultsService.addAttachment(req.params.id, attachment, req.user.id);
    if (!updated) return res.status(404).json({ error: 'Lab result not found' });
    res.json(updated);
  }),
];

exports.list = [
  checkPermission('lab:results:view'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  asyncHandler(async (req, res) => {
    const data = await LabResultsService.list({ page: req.query.page || 1, limit: req.query.limit || 20 });
    res.json(data);
  }),
];

exports.listByPatient = [
  checkPermission('lab:results:view'),
  param('patientId').isMongoId(),
  asyncHandler(async (req, res) => {
    const data = await LabResultsService.listByPatient(req.params.patientId, {
      page: req.query.page || 1, limit: req.query.limit || 20,
    });
    res.json(data);
  }),
];

exports.get = [
  checkPermission('lab:results:view'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const r = await LabResultsRepo.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json(r);
  }),
];

exports.remove = [
  checkPermission('lab:results:delete'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await LabResultsRepo.deleteById(req.params.id);
    res.json({ ok: true });
  }),
];
