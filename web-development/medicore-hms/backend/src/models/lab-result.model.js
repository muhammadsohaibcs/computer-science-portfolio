/**
 * src/models/lab-result.model.js
 *
 * Stores lab test results created by lab technicians. Attachments hold file URLs or storage references.
 */

const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  testName: { type: String, required: true, index: true },
  result: { type: String },
  normalRange: String,
  units: String,
  attachments: [{ filename: String, url: String }],
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // lab technician
  performedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// index for querying by patient and testName
labResultSchema.index({ patient: 1, testName: 1 });

module.exports = mongoose.model('LabResult', labResultSchema);
