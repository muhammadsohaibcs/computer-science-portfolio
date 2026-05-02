const { body, param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const ServicesService = require('../services/services.service');
const auth = require('../middleware/auth.middleware');

exports.create = [
  auth(['Admin']),
  body('name').isString().notEmpty(),
  asyncHandler(async (req, res) => res.status(201).json(await ServicesService.create(req.body)))
];

exports.list = [
  auth(['Admin','Receptionist','Doctor']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('department').optional().isString(),
  query('category').optional().isString(),
  asyncHandler(async (req, res) => {
    const data = await ServicesService.list({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      department: req.query.department,
      category: req.query.category
    });
    res.json(data);
  })
];

exports.get = [
  auth(['Admin','Doctor','Receptionist']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => res.json(await ServicesService.get(req.params.id)))
];

exports.update = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const updated = await ServicesService.update(req.params.id, req.body);
    res.json(updated);
  })
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await ServicesService.remove(req.params.id);
    res.json({ ok: true });
  })
];
