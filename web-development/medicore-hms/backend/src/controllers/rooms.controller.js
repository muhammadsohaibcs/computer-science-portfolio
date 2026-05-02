const { body, param, query, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const { checkPermission } = require('../middleware/permissions.middleware');
const RoomsRepo = require('../repositories/rooms.repo');
const RoomsService = require('../services/rooms.service');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

exports.create = [
  checkPermission('rooms:create'),
  body('number').isString().notEmpty(),
  body('type').isIn(['General','Private','ICU','Operation']),
  asyncHandler(async (req, res) => {
    const payload = {
      number: req.body.number,
      type: req.body.type,
      status: req.body.status || 'Available',
      department: req.body.department
    };
    const r = await RoomsService.create(payload);
    res.status(201).json(r);
  })
];

exports.list = [
  checkPermission('rooms:view'),
  query('type').optional().isString(),
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  asyncHandler(async (req, res) => {
    const result = await RoomsService.list({
      type: req.query.type,
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit
    });
    res.json(result);
  })
];

exports.get = [
  checkPermission('rooms:view'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const room = await RoomsRepo.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  })
];

exports.assign = [
  checkPermission('rooms:assign'),
  param('id').isMongoId(),
  body('patientId').isMongoId(),
  asyncHandler(async (req, res) => {
    const roomId = req.params.id;
    const patientId = req.body.patientId;
    const updated = await RoomsRepo.assignRoom(roomId, patientId);
    if (!updated) return res.status(409).json({ error: 'Room not available or assignment failed' });
    res.json(updated);
  })
];

exports.release = [
  checkPermission('rooms:release'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const roomId = req.params.id;
    const updated = await RoomsRepo.releaseRoom(roomId);
    res.json(updated);
  })
];

exports.update = [
  checkPermission('rooms:update'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const updated = await RoomsRepo.updateById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  })
];

exports.remove = [
  checkPermission('rooms:delete'),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await RoomsRepo.deleteById(req.params.id);
    res.json({ ok: true });
  })
];
