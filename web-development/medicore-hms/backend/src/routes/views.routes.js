/**
 * views.routes.js
 * 
 * Routes for MongoDB views
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/views.controller');

// View routes
router.get('/active-appointments', ctrl.getActiveAppointments);
router.get('/low-stock-inventory', ctrl.getLowStockInventory);
router.get('/unpaid-bills', ctrl.getUnpaidBills);
router.get('/recent-medical-records', ctrl.getRecentMedicalRecords);
router.get('/active-insurance', ctrl.getActiveInsurance);
router.get('/doctor-schedule', ctrl.getDoctorSchedule);
router.get('/patient-summary', ctrl.getPatientSummary);
router.get('/list', ctrl.listViews);

module.exports = router;
