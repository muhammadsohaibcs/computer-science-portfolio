const { body, param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const InventoryService = require('../services/inventory.service');
const auth = require('../middleware/auth.middleware');

exports.create = [
  auth(['Admin']),
  body('itemCode').isString().notEmpty(),
  body('name').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const item = await InventoryService.create(req.body);
    res.status(201).json(item);
  })
];

exports.list = [
  auth(['Admin','Pharmacist']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('supplier').optional().isMongoId(),
  query('q').optional().isString(),
  asyncHandler(async (req, res) => {
    const result = await InventoryService.list({
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      supplier: req.query.supplier,
      q: req.query.q
    });
    res.json(result);
  })
];

exports.get = [
  auth(['Admin','Pharmacist']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const item = await InventoryService.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  })
];

exports.getItem = [
  auth(['Admin','Pharmacist']),
  param('code').isString(),
  asyncHandler(async (req, res) => res.json(await InventoryService.getItem(req.params.code)))
];

exports.update = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id || 'anonymous';
    const updated = await InventoryService.update(req.params.id, req.body, userId);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  })
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await InventoryService.remove(req.params.id);
    res.json({ ok: true });
  })
];

exports.decrement = [
  auth(['Pharmacist']),
  body('itemCode').isString(),
  body('qty').isInt({ min: 1 }),
  asyncHandler(async (req, res) => res.json(await InventoryService.decrement(req.body.itemCode, req.body.qty)))
];

exports.bulkAdjust = [
  auth(['Admin']),
  body('updates').isArray(),
  asyncHandler(async (req, res) => res.json(await InventoryService.bulkAdjust(req.body.updates)))
];

exports.lowStock = [
  auth(['Admin','Pharmacist']),
  asyncHandler(async (req, res) => res.json(await InventoryService.lowStock()))
];
