/**
 * src/models/prescription.model.js
 *
 * Represents prescriptions created by doctors for patients.
 */

const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  name: String,
  dose: String,
  qty: Number,
  instructions: String
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  drugs: [drugSchema],
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

prescriptionSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
