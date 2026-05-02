/**
 * src/models/patient.model.js
 *
 * Patient profile document.
 *
 * Design notes:
 * - Use references for medicalRecords (potentially many) to avoid huge patient documents.
 * - Index name and contact.phone for fast lookup (see Lab 07/08 on indexes & explain). :contentReference[oaicite:3]{index=3}
 */

const mongoose = require('mongoose');
const optimisticLockingPlugin = require('../database/plugins/optimistic-locking.plugin');

const contactSchema = new mongoose.Schema({
  phone: { type: String, index: true },
  email: { type: String, index: true },
  address: String
}, { _id: false });

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  dob: { type: Date },
  gender: { type: String, enum: ['Male','Female','Other'], default: 'Other' },
  contact: contactSchema,
  emergencyContact: {
    name: String,
    phone: String
  },
  medicalRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }], // reference, multikey index
  primaryDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Apply optimistic locking plugin for concurrent update protection
patientSchema.plugin(optimisticLockingPlugin);

// recommended compound index for common queries (name + createdAt) for recent patients search
patientSchema.index({ name: 1, createdAt: -1 });

// Multikey index on medicalRecords array for reverse lookups
// Allows queries like: Patient.find({ medicalRecords: recordId })
patientSchema.index({ medicalRecords: 1 });

module.exports = mongoose.model('Patient', patientSchema);
