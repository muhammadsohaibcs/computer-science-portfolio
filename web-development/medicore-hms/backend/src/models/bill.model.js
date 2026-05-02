/**
 * src/models/bill.model.js
 *
 * Billing document referencing patient, services, and payments.
 * Keep payment transactions minimal — integrate with payment gateway for real money flows.
 */

const mongoose = require('mongoose');
const optimisticLockingPlugin = require('../database/plugins/optimistic-locking.plugin');

const lineItemSchema = new mongoose.Schema({
  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service',
    required: false,
    validate: {
      validator: function(v) {
        // Allow null/undefined or valid ObjectId
        return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Service must be a valid ObjectId or empty'
    }
  },
  description: String,
  quantity: { type: Number, default: 1 },
  unitPrice: Number,
  totalPrice: Number
}, { _id: false });

const billSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [lineItemSchema],
  subtotal: Number,
  taxes: Number,
  total: Number,
  paid: { type: Boolean, default: false },
  payments: [{ method: String, amount: Number, timestamp: Date }]
}, { timestamps: true });

// Apply optimistic locking plugin for concurrent update protection
billSchema.plugin(optimisticLockingPlugin);

// index for patient bills lookup
billSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('Bill', billSchema);
