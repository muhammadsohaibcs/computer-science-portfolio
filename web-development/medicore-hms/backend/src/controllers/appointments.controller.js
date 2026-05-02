const { body, param, query } = require('express-validator');
const asyncHandler = require('../middleware/async-handler');
const AppointmentsService = require('../services/appointments.service');
const auth = require('../middleware/auth.middleware');

exports.create = [
  auth(['Admin','Receptionist','Doctor','Patient']),
  body('patient').isMongoId(),
  body('doctor').isMongoId(),
  body('appointmentDate').isISO8601(),
  asyncHandler(async (req, res) => {
    try {
      const appointment = await AppointmentsService.create(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      if (error.message.includes('conflict')) {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
];

exports.list = [
  auth(['Admin','Doctor','Nurse','Receptionist']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('patient').optional().isMongoId(),
  query('doctor').optional().isMongoId(),
  query('status').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  asyncHandler(async (req, res) => {
    const result = await AppointmentsService.list({
      page: req.query.page,
      limit: req.query.limit,
      patient: req.query.patient,
      doctor: req.query.doctor,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });
    res.json(result);
  })
];

exports.get = [
  auth(['Admin','Doctor','Nurse','Receptionist','Patient']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    const appointment = await AppointmentsService.get(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Not found' });
    res.json(appointment);
  })
];

exports.update = [
  auth(['Receptionist','Doctor','Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    try {
      const updated = await AppointmentsService.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json(updated);
    } catch (error) {
      if (error.message.includes('conflict')) {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  })
];

exports.remove = [
  auth(['Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => {
    await AppointmentsService.remove(req.params.id);
    res.json({ ok: true });
  })
];

exports.getDoctorSchedule = [
  auth(['Admin','Doctor','Nurse','Receptionist']),
  query('start').isISO8601(), query('end').isISO8601(),
  asyncHandler(async (req, res) => res.json(await AppointmentsService.listDoctor(req.query.doctor, new Date(req.query.start), new Date(req.query.end))))
];

exports.listPatient = [
  auth(['Admin','Doctor','Patient','Receptionist']),
  param('patientId').isMongoId(),
  asyncHandler(async (req, res) => res.json(await AppointmentsService.listPatient(req.params.patientId)))
];

exports.cancel = [
  auth(['Receptionist','Doctor','Admin']),
  param('id').isMongoId(),
  asyncHandler(async (req, res) => res.json(await AppointmentsService.cancel(req.params.id, req.body.reason)))
];
