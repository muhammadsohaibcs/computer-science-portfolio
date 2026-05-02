const { body, param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const BillsService = require('../services/bills.service');
const auth = require('../middleware/auth.middleware');

exports.create = [
  auth(['Admin','Receptionist']),
  body('patient').isMongoId(),
  body('items').isArray(),
  asyncHandler(async (req, res) => res.status(201).json(await BillsService.createBill(req.body.patient, req.body.items, req.user.sub, req.body.adjustInventory)))
];

exports.list = [
  auth(['Admin','Receptionist']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('patient').optional().isMongoId(),
  query('paid').optional().isString(),
  asyncHandler(async (req, res) => {
    const result = await BillsService.list({
      page: req.query.page,
      limit: req.query.limit,
      patient: req.query.patient,
      paid: req.query.paid
    });
    res.json(result);
  })
];

exports.get = [
  auth(['Admin','Receptionist','Patient']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const bill = await BillsService.get(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Not found' });
    res.json(bill);
  })
];

exports.update = [
  auth(['Admin','Receptionist']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const updated = await BillsService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  })
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await BillsService.remove(req.params.id);
    res.json({ ok: true });
  })
];

exports.pay = [
  auth(['Admin','Receptionist']),
  param('id').isMongoId(),
  body('payment').notEmpty(),
  asyncHandler(async (req, res) => res.json(await BillsService.payBill(req.params.id, req.body.payment)))
];

exports.listByPatient = [
  auth(['Admin','Receptionist','Patient']),
  param('patientId').isMongoId(),
  asyncHandler(async (req, res) => res.json(await BillsService.listByPatient(req.params.patientId)))
];
