/**
 * src/models/medical-record.model.js
 *
 * Represents a single medical record entry for a patient.
 *
 * Design notes:
 * - Medical records are referenced by Patient to avoid unbounded document growth in patient collection.
 * - Keep attachments as array of file paths/URLs (store files in secure blob storage in prod).
 */

const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  notes: { type: String },
  attachments: [{ filename: String, url: String }], // store metadata only
  tags: [String], // multikey index for tag-based searches
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// index by patient + createdAt for efficient retrieval of a patient's records
medicalRecordSchema.index({ patient: 1, createdAt: -1 });

// Multikey index on tags array for efficient tag-based filtering
// Allows queries like: MedicalRecord.find({ tags: 'diabetes' })
medicalRecordSchema.index({ tags: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
