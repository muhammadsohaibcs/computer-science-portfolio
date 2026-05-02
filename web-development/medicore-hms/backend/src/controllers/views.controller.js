/**
 * views.controller.js
 * 
 * Controller for MongoDB views endpoints
 */

const asyncHandler = require('../middleware/async-handler');
const auth = require('../middleware/auth.middleware');
const ViewsService = require('../services/views.service');

// Get active appointments
exports.getActiveAppointments = [
  auth(['Admin', 'Doctor', 'Nurse', 'Receptionist']),
  asyncHandler(async (req, res) => {
    const appointments = await ViewsService.getActiveAppointments();
    res.json({ data: appointments, count: appointments.length });
  })
];

// Get low stock inventory
exports.getLowStockInventory = [
  auth(['Admin', 'Nurse', 'Receptionist']),
  asyncHandler(async (req, res) => {
    const items = await ViewsService.getLowStockInventory();
    res.json({ data: items, count: items.length });
  })
];

// Get unpaid bills
exports.getUnpaidBills = [
  auth(['Admin', 'Receptionist']),
  asyncHandler(async (req, res) => {
    const daysOverdue = req.query.daysOverdue ? parseInt(req.query.daysOverdue) : null;
    const bills = await ViewsService.getUnpaidBills(daysOverdue);
    res.json({ data: bills, count: bills.length });
  })
];

// Get recent medical records
exports.getRecentMedicalRecords = [
  auth(['Admin', 'Doctor', 'Nurse']),
  asyncHandler(async (req, res) => {
    const patientId = req.query.patientId || null;
    const records = await ViewsService.getRecentMedicalRecords(patientId);
    res.json({ data: records, count: records.length });
  })
];

// Get active insurance
exports.getActiveInsurance = [
  auth(['Admin', 'Receptionist']),
  asyncHandler(async (req, res) => {
    const expiringInDays = req.query.expiringInDays ? parseInt(req.query.expiringInDays) : null;
    const policies = await ViewsService.getActiveInsurance(expiringInDays);
    res.json({ data: policies, count: policies.length });
  })
];

// Get doctor schedule
exports.getDoctorSchedule = [
  auth(['Admin', 'Doctor', 'Nurse', 'Receptionist']),
  asyncHandler(async (req, res) => {
    const doctorId = req.query.doctorId || null;
    const date = req.query.date || null;
    const schedules = await ViewsService.getDoctorSchedule(doctorId, date);
    res.json({ data: schedules, count: schedules.length });
  })
];

// Get patient summary
exports.getPatientSummary = [
  auth(['Admin', 'Doctor', 'Nurse', 'Receptionist']),
  asyncHandler(async (req, res) => {
    const patientId = req.query.patientId || null;
    const summaries = await ViewsService.getPatientSummary(patientId);
    res.json({ data: summaries, count: summaries.length });
  })
];

// List all views
exports.listViews = [
  auth(['Admin']),
  asyncHandler(async (req, res) => {
    const views = await ViewsService.listViews();
    res.json({ data: views, count: views.length });
  })
];
