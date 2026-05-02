/**
 * src/models/staff.model.js
 *
 * Generic staff (non-doctor) like nurses, technicians, receptionists.
 *
 * Keep lightweight and reference User for auth linkage.
 */

const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  roleTitle: { type: String }, // e.g., 'Senior Nurse'
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true }
}, { timestamps: true });

staffSchema.index({ department: 1, name: 1 });

module.exports = mongoose.model('Staff', staffSchema);
