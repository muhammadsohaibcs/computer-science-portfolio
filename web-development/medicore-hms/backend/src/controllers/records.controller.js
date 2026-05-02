const { body, param } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const RecordsService = require('../services/records.service');
const auth = require('../middleware/auth.middleware');

exports.addRecord = [
  auth(['Admin','Doctor','Nurse']),
  body('patient').isMongoId(),
  body('notes').optional().isString(),
  asyncHandler(async (req, res) => res.status(201).json(await RecordsService.addMedicalRecord ? await RecordsService.addMedicalRecord(req.body.patient, req.body, req.user.sub) : await RecordsService.create(req.body)))
];

exports.list = [
  auth(['Admin','Doctor','Nurse']),
  asyncHandler(async (req, res) => {
    const result = await RecordsService.list({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search
    });
    res.json(result);
  })
];

exports.get = [
  auth(['Admin','Doctor','Nurse','Patient']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const record = await RecordsService.get(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json({ data: record });
  })
];

exports.update = [
  auth(['Admin','Doctor','Nurse']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const updated = await RecordsService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ data: updated });
  })
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await RecordsService.remove(req.params.id);
    res.json({ ok: true });
  })
];

exports.listByPatient = [
  auth(['Admin','Doctor','Nurse','Patient']),
  param('patientId').isMongoId(),
  asyncHandler(async (req, res) => res.json(await RecordsService.listByPatient(req.params.patientId)))
];

exports.addAttachment = [
  auth(['Admin','Doctor','Lab Technician','Nurse']),
  param('id').isMongoId(),
  body('filename').isString(),
  body('url').isURL(),
  asyncHandler(async (req, res) => res.json(await RecordsService.addAttachment(req.params.id, { filename: req.body.filename, url: req.body.url }, req.user.sub)))
];
