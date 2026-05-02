/**
 * src/models/service.model.js
 *
 * Clinical services offered (e.g., 'X-Ray', 'Blood Test', 'OP Consultation').
 * Useful for billing & scheduling.
 */

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  description: String,
  basePrice: { type: Number, required: true },
  durationMinutes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
