/**
 * src/models/inventory.model.js
 *
 * Inventory for pharmacy & hospital supplies.
 *
 * Notes:
 * - Unique itemCode helps quick lookups (create unique index, careful for migrations).
 * - Track reorderThreshold to automate restock alerts.
 */

const mongoose = require('mongoose');
const optimisticLockingPlugin = require('../database/plugins/optimistic-locking.plugin');

const inventorySchema = new mongoose.Schema({
  itemCode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  category: String,
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' },
  reorderThreshold: { type: Number, default: 10 },
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier',
    required: false,
    validate: {
      validator: function(v) {
        // Allow null/undefined or valid ObjectId
        return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Supplier must be a valid ObjectId or empty'
    }
  }
}, { timestamps: true });

// Apply optimistic locking plugin for concurrent update protection
inventorySchema.plugin(optimisticLockingPlugin);

// index suggestions (single-field & compound for category + quantity)
inventorySchema.index({ category: 1, quantity: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
