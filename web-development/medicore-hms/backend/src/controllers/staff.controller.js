const { param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const StaffService = require('../services/staff.service');
const auth = require('../middleware/auth.middleware');
const { createStaffValidators, updateStaffValidators } = require('../validators/staff.validators');
const validate = require('../middleware/validation.middleware');

exports.create = [
  auth(['Admin']),
  ...createStaffValidators,
  validate(createStaffValidators),
  asyncHandler(async (req, res) => res.status(201).json(await StaffService.create(req.body)))
];

exports.list = [
  auth(['Admin','Receptionist']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('department').optional().isMongoId(),
  query('roleTitle').optional().isString(),
  query('q').optional().isString(),
  asyncHandler(async (req, res) => {
    const result = await StaffService.list({
      page: req.query.page,
      limit: req.query.limit,
      department: req.query.department,
      roleTitle: req.query.roleTitle,
      q: req.query.q
    });
    res.json(result);
  })
];

exports.get = [
  auth(['Admin','Receptionist']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const staff = await StaffService.get(req.params.id);
    if (!staff) return res.status(404).json({ error: 'Not found' });
    res.json(staff);
  })
];

exports.listByDept = [
  auth(['Admin','Receptionist']),
  param('deptId').isMongoId(),
  asyncHandler(async (req, res) => res.json(await StaffService.listByDepartment(req.params.deptId)))
];

exports.getByUser = [
  auth(['Admin','Staff']),
  param('userId').isMongoId(),
  asyncHandler(async (req, res) => res.json(await StaffService.getByUser(req.params.userId)))
];

exports.update = [
  auth(['Admin']),
  param('id').isMongoId(),
  ...updateStaffValidators,
  validate(updateStaffValidators),
  asyncHandler(async (req, res) => {
    const updated = await StaffService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  })
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await StaffService.remove(req.params.id);
    res.json({ ok: true });
  })
];
