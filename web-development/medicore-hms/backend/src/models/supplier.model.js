/**
 * src/models/supplier.model.js
 *
 * Suppliers for inventory items and medicine.
 */

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  contact: {
    phone: String,
    email: String,
    address: String
  },
  itemsSupplied: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }]
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
