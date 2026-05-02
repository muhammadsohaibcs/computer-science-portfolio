const { body, param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const { checkPermission } = require('../middleware/permissions.middleware');
const DepartmentsRepo = require('../repositories/departments.repo');
const DepartmentsService = require('../services/departments.service');
const logger = require('../utils/logger');

// CREATE
exports.create = [
  checkPermission('departments:create'),
  body('name').isString().notEmpty(),
  body('code').isString().optional(),
  asyncHandler(async (req, res) => {
    const payload = {
      name: req.body.name.trim(),
      code: req.body.code ? req.body.code.trim() : undefined,
      description: req.body.description
    };

    const existing = await DepartmentsRepo.findByCode(payload.code);
    if (existing) return res.status(409).json({ error: 'Department code already exists' });

    const dept = await DepartmentsService.create(payload);
    res.status(201).json(dept);
  })
];

// LIST
exports.list = [
  checkPermission('departments:view'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  asyncHandler(async (req, res) => {
    const result = await DepartmentsService.list({
      page: req.query.page,
      limit: req.query.limit
    });
    res.json(result);
  })
];

// GET ONE
exports.get = [
  checkPermission('departments:view'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const dept = await DepartmentsRepo.findById(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json(dept);
  })
];

// UPDATE
exports.update = [
  checkPermission('departments:update'),
  param('id').isMongoId(),
  body('name').optional().isString(),
  body('code').optional().isString(),
  asyncHandler(async (req, res) => {
    const updated = await DepartmentsRepo.updateById(req.params.id, { $set: req.body });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  })
];

// DELETE
exports.remove = [
  checkPermission('departments:delete'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await DepartmentsRepo.deleteById(req.params.id);
    res.json({ ok: true });
  })
];

// STATS
exports.stats = [
  checkPermission('departments:view'),
  asyncHandler(async (req, res) => {
    const totalDepartments = await DepartmentsRepo.count();
    const staffCounts = await DepartmentsRepo.statsDepartmentCounts();

    res.json({
      total: totalDepartments,
      departmentStaffCounts: staffCounts
    });
  })
];
