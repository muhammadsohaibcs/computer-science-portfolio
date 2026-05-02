/**
 * bills.service.js
 *
 * - Create bills, process payment, support transaction with inventory/billing flows
 */

const mongoose = require('mongoose');
const BillsRepo = require('../repositories/bills.repo');
const InventoryRepo = require('../repositories/inventory.repo');
const logger = require('../utils/logger');

class BillsService {
  /**
   * Create a bill. If invoice requires dispensing items, pass items and optionally perform inventory decrement in a session.
   * items format: [{ itemCode, qty, unitPrice }]
   */
  async createBill(patientId, items = [], createdBy, adjustInventory = false) {
    // Check if transactions are supported (replica set or mongos)
    const supportsTransactions = mongoose.connection.readyState === 1 && 
                                  mongoose.connection.db?.topology?.description?.type !== 'Single';
    
    if (supportsTransactions && adjustInventory && items.length) {
      // Use transaction for atomic operations
      const session = await mongoose.startSession();
      try {
        let bill;
        await session.withTransaction(async () => {
          bill = await BillsRepo.createBillForPatient(patientId, items, createdBy, session);
          const updates = items.map(it => ({ itemCode: it.itemCode, qtyDelta: -Math.abs(it.qty) }));
          await InventoryRepo.bulkAdjust(updates, session);
        });
        session.endSession();
        logger.info({ billId: bill._id, patientId }, 'Bill created with transaction');
        return bill;
      } catch (err) {
        session.endSession();
        throw err;
      }
    } else {
      // Fallback to non-transactional operations for standalone MongoDB
      try {
        const bill = await BillsRepo.createBillForPatient(patientId, items, createdBy);
        
        if (adjustInventory && items.length) {
          const updates = items.map(it => ({ itemCode: it.itemCode, qtyDelta: -Math.abs(it.qty) }));
          await InventoryRepo.bulkAdjust(updates);
        }
        
        logger.info({ billId: bill._id, patientId }, 'Bill created without transaction');
        return bill;
      } catch (err) {
        logger.error({ error: err.message, patientId }, 'Failed to create bill');
        throw err;
      }
    }
  }

  async list({ page = 1, limit = 20, patient = null, paid = null } = {}) {
    const filter = {};
    if (patient) filter.patient = patient;
    if (paid !== null && paid !== undefined) filter.paid = paid === 'true' || paid === true;
    
    // Get total count for pagination
    const totalItems = await BillsRepo.count(filter);
    const data = await BillsRepo.find(filter, null, { page, limit });
    
    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit
      }
    };
  }

  async get(id) {
    return BillsRepo.findById(id);
  }

  async update(id, data) {
    return BillsRepo.updateById(id, data);
  }

  async remove(id) {
    return BillsRepo.deleteById(id);
  }

  async listByPatient(patientId) {
    return BillsRepo.find({ patient: patientId }, null, { limit: 100 });
  }

  async payBill(billId, payment) {
    return BillsRepo.markPaid(billId, payment);
  }
}

module.exports = new BillsService();
