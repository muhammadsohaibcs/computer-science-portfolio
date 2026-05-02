/**
 * src/models/appointment.model.js
 *
 * Appointment document references Patient and Doctor.
 *
 * Design notes:
 * - Keep appointment lightweight for fast queries (doctor + date indexed).
 * - Use compound index to speed up queries that find a doctor's appointments for a date range (Lab 08). :contentReference[oaicite:4]{index=4}
 */

const mongoose = require('mongoose');
const optimisticLockingPlugin = require('../database/plugins/optimistic-locking.plugin');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  appointmentDate: { type: Date, required: true, index: true },
  durationMinutes: { type: Number, default: 30 },
  status: { type: String, enum: ['Scheduled','Completed','Cancelled','NoShow'], default: 'Scheduled', index: true },
  reason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Apply optimistic locking plugin for concurrent update protection
appointmentSchema.plugin(optimisticLockingPlugin);

// compound index to support "doctor's schedule" queries and avoid full collection scans
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
