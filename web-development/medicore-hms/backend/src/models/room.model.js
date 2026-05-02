/**
 * src/models/room.model.js
 *
 * Rooms or wards details. Track occupancy status for quick availability checks.
 */

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, index: true },
  type: { type: String, enum: ['General','Private','ICU','Operation'], required: true },
  status: { type: String, enum: ['Available','Occupied','Maintenance'], default: 'Available', index: true },
  assignedPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, // nullable
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

roomSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Room', roomSchema);
