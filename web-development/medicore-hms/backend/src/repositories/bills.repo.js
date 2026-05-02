/**
 * bills.repo.js
 *
 * Billing operations: create bill, add line items, mark paid.
 * For atomic operations (create bill + update inventory), pass a session.
 */

const BaseRepository = require('./base.repo');
const Bill = require('../models/bill.model');

class BillsRepository extends BaseRepository {
  constructor() {
    super(Bill);
  }

  async createBillForPatient(patientId, items, createdBy, session = null) {
    const subtotal = items.reduce((s, i) => s + (i.totalPrice || (i.unitPrice * (i.quantity || 1))), 0);
    const taxes = Number((subtotal * 0.15).toFixed(2)); // example tax
    const total = Number((subtotal + taxes).toFixed(2));
    const bill = { patient: patientId, items, subtotal, taxes, total, createdBy };
    return this.create(bill, session);
  }

  async markPaid(billId, payment, session = null) {
    return this.model.findByIdAndUpdate(billId, { $set: { paid: true }, $push: { payments: payment } }, { new: true, session }).exec();
  }

  async listByPatient(patientId, options = {}) {
    return this.find({ patient: patientId }, null, options);
  }
}

module.exports = new BillsRepository();
