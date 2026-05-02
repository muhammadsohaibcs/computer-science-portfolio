/**
 * src/models/doctor.model.js
 *
 * Doctor profile and basic schedule meta.
 *
 * Notes:
 * - 'user' links to credentials in User collection (one-to-one).
 * - specializations stored as array for flexible querying.
 */

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  specialization: { type: [String], index: true }, // multikey index for specialization array
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  bio: String,
  contact: {
    phone: String,
    email: String
  },
  // quick availability meta (not substitute for calendar)
  availability: {
    weekdays: [Number], // 0-6, multikey index for weekday availability queries
    startTime: String,
    endTime: String
  }
}, { timestamps: true });

// Multikey compound index for queries by specialization and name
// Allows queries like: Doctor.find({ specialization: 'Cardiology', name: /John/ })
doctorSchema.index({ specialization: 1, name: 1 });

// Multikey index on availability.weekdays for finding doctors available on specific days
// Allows queries like: Doctor.find({ 'availability.weekdays': 1 }) // Monday
doctorSchema.index({ 'availability.weekdays': 1 });

module.exports = mongoose.model('Doctor', doctorSchema);

