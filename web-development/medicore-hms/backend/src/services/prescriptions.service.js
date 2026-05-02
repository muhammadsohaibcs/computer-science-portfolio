/**
 * prescriptions.service.js
 *
 * - Create prescriptions
 * - Fulfill (decrement inventory + mark fulfilled) using transactions
 */

const mongoose = require('mongoose');
const PrescriptionsRepo = require('../repositories/prescriptions.repo');
const InventoryRepo = require('../repositories/inventory.repo');
const logger = require('../utils/logger');

class PrescriptionsService {
  async create(prescData) {
    return PrescriptionsRepo.createForPatient(prescData);
  }

  async list(options = {}) {
    return PrescriptionsRepo.findAll(options);
  }

  async listByPatient(patientId, options = {}) {
    return PrescriptionsRepo.findByPatient(patientId, options);
  }

  async get(id) {
    return PrescriptionsRepo.findById(id);
  }

  async update(id, data) {
    return PrescriptionsRepo.update(id, data);
  }

  async remove(id) {
    return PrescriptionsRepo.delete(id);
  }

  /**
   * Fulfill prescription: decrement inventory for each item and mark prescription fulfilled atomically.
   * items: [{ itemCode, qty }]
   */
  async fulfill(prescriptionId, items, fulfilledBy) {
    const session = await mongoose.startSession();
    let fulfilled;
    try {
      await session.withTransaction(async () => {
        // decrement stock
        for (const it of items) {
          const updated = await InventoryRepo.decrementStock(it.itemCode, it.qty, session);
          if (!updated) throw new Error(`Insufficient stock for ${it.itemCode}`);
        }
        // mark prescription fulfilled
        fulfilled = await PrescriptionsRepo.markFulfilled(prescriptionId, fulfilledBy, session);
      });
      session.endSession();
      logger.info({ prescriptionId, fulfilledBy }, 'Prescription fulfilled');
      return fulfilled;
    } catch (err) {
      session.endSession();
      throw err;
    }
  }
}

module.exports = new PrescriptionsService();
