/**
 * src/models/department.model.js
 *
 * Hospital departments — e.g., Cardiology, Radiology.
 */

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  code: { type: String, unique: true, index: true },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
