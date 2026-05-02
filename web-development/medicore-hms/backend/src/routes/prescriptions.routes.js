const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prescriptions.controller');

// List all prescriptions (with pagination)
router.get('/', ctrl.list);

// Create new prescription
router.post('/', ctrl.create);

// List prescriptions by patient
router.get('/patient/:patientId', ctrl.listByPatient);

// Fulfill prescription
router.post('/:id/fulfill', ctrl.fulfill);

// Get single prescription
router.get('/:id', ctrl.get);

// Update prescription
router.put('/:id', ctrl.update);

// Delete prescription
router.delete('/:id', ctrl.remove);

module.exports = router;