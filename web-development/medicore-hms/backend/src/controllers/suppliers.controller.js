const { body, param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const { checkPermission } = require('../middleware/permissions.middleware');
const SuppliersRepo = require('../repositories/suppliers.repo');
const InventoryRepo = require('../repositories/inventory.repo');

/**
 * Suppliers controller:
 * - CRUD
 * - link supplier to inventory items
 * - search
 *
 * Lab mapping: inventory-supplier relationships and procurement flows (Lab 06/07)
 */

exports.create = [
  checkPermission('suppliers:create'),
  body('name').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const payload = {
      name: req.body.name,
      contact: req.body.contact || {}
    };
    const s = await SuppliersRepo.create(payload);
    res.status(201).json(s);
  })
];

exports.list = [
  checkPermission('suppliers:view'),
  query('q').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  asyncHandler(async (req, res) => {
    const SuppliersService = require('../services/suppliers.service');
    const result = await SuppliersService.list({
      q: req.query.q,
      page: req.query.page,
      limit: req.query.limit
    });
    res.json(result);
  })
];

exports.get = [
  checkPermission('suppliers:view'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const s = await SuppliersRepo.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json(s);
  })
];

exports.addSuppliedItem = [
  checkPermission('suppliers:update'),
  param('id').isMongoId(),
  body('itemCode').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const supplierId = req.params.id;
    const { itemCode } = req.body;
    const item = await InventoryRepo.findByItemCode(itemCode);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    const updated = await SuppliersRepo.addSuppliedItem(supplierId, item._id);
    res.json(updated);
  })
];

exports.update = [
  checkPermission('suppliers:update'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const updated = await SuppliersRepo.updateById(req.params.id, { $set: req.body });
    res.json(updated);
  })
];

exports.remove = [
  checkPermission('suppliers:delete'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await SuppliersRepo.deleteById(req.params.id);
    res.json({ ok: true });
  })
];
