/**
 * src/repositories/inventory.repo.js
 *
 * Handles Inventory operations:
 * - CRUD via BaseRepository
 * - Stock increment/decrement with $inc (atomic)
 * - Low-stock detection
 * - Bulk adjustments
 * - Supplier linking supported from suppliers.repo.js
 */

const BaseRepository = require('./base.repo');
const Inventory = require('../models/inventory.model');

class InventoryRepository extends BaseRepository {
  constructor() {
    super(Inventory);
  }

  /**
   * Find inventory item by itemCode
   */
  async findByItemCode(code) {
    return this.model.findOne({ itemCode: code }).lean().exec();
  }

  /**
   * Decrease stock quantity (atomic)
   * Fails if existing quantity < required qty (prevents negative stock)
   */
  async decrementStock(itemCode, qty, session = null) {
    const update = { $inc: { quantity: -Math.abs(qty) } };
    const opts = { new: true };
    if (session) opts.session = session;

    return this.model
      .findOneAndUpdate(
        { itemCode, quantity: { $gte: qty } },
        update,
        opts
      )
      .lean()
      .exec();
  }

  /**
   * Increase stock quantity (atomic)
   */
  async incrementStock(itemCode, qty, session = null) {
    const update = { $inc: { quantity: Math.abs(qty) } };
    const opts = { new: true };
    if (session) opts.session = session;

    return this.model
      .findOneAndUpdate({ itemCode }, update, opts)
      .lean()
      .exec();
  }

  /**
   * List inventory items below reorder threshold
   */
  async itemsBelowThreshold() {
    return this.model
      .find({
        $expr: { $lte: ['$quantity', '$reorderThreshold'] }
      })
      .lean()
      .exec();
  }

  /**
   * Bulk adjustments (for large transactions)
   * updates = [ { itemCode, qtyDelta }, ... ]
   */
  async bulkAdjust(updates = [], session = null) {
    const ops = updates.map(u => ({
      updateOne: {
        filter: { itemCode: u.itemCode },
        update: { $inc: { quantity: u.qtyDelta } }
      }
    }));

    const opts = {};
    if (session) opts.session = session;

    return this.model.bulkWrite(ops, opts);
  }
}

module.exports = new InventoryRepository();
