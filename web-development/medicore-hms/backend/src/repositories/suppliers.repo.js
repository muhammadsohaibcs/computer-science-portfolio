/**
 * src/repositories/suppliers.repo.js
 *
 * Suppliers repository:
 * - Link suppliers to inventory items
 * - Search & pagination
 */

const BaseRepository = require('./base.repo');
const Supplier = require('../models/supplier.model');

class SuppliersRepository extends BaseRepository {
  constructor() {
    super(Supplier);
  }

  async findByName(name, limit = 50) {
    return this.model.find({ name: new RegExp(name, 'i') }).limit(limit).lean().exec();
  }

  async addSuppliedItem(supplierId, itemId, session = null) {
    const update = { $addToSet: { itemsSupplied: itemId } };
    const opts = { new: true };
    if (session) opts.session = session;
    return this.model.findByIdAndUpdate(supplierId, update, opts).lean().exec();
  }

  async explainSuppliers(filter = {}) {
    return this.explainQuery(filter);
  }
}

module.exports = new SuppliersRepository();
