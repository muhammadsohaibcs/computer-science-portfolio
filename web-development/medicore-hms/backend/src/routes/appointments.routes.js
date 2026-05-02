const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/appointments.controller');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/doctor', ctrl.getDoctorSchedule);
router.get('/patient/:patientId', ctrl.listPatient);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/cancel', ctrl.cancel);

module.exports = router;