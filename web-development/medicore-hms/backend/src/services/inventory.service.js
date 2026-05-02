/**
 * inventory.service.js
 *
 * - High level stock operations with concurrency safety
 * - Reorder notifications helper (could feed into a notification microservice)
 */

const mongoose = require('mongoose');
const InventoryRepo = require('../repositories/inventory.repo');
const SuppliersRepo = require('../repositories/suppliers.repo');
const lockingService = require('./locking.service');
const logger = require('../utils/logger');

class InventoryService {
  async create(data) {
    return InventoryRepo.create(data);
  }

  async list({ page = 1, limit = 20, category = null, supplier = null, q = null } = {}) {
    const filter = {};
    if (category) filter.category = category;
    if (supplier) filter.supplier = supplier;
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { itemCode: new RegExp(q, 'i') }
      ];
    }
    
    // Get total count for pagination
    const totalItems = await InventoryRepo.count(filter);
    const data = await InventoryRepo.find(filter, null, { page, limit });
    
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
    return InventoryRepo.findById(id);
  }

  async getItem(code) {
    return InventoryRepo.findByItemCode(code);
  }

  async update(id, data, userId = 'system') {
    // Apply pessimistic locking for 30 seconds
    const resourceId = `inventory:${id}`;
    const lockTimeout = 30000; // 30 seconds
    
    return lockingService.withLock(resourceId, userId, async () => {
      logger.info({ id, userId }, 'Updating inventory with pessimistic lock');
      
      // Simulate a longer operation so the lock is visible (10 seconds for demo)
      // Remove this line for production use
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      return InventoryRepo.updateById(id, data);
    }, lockTimeout);
  }

  async remove(id) {
    return InventoryRepo.deleteById(id);
  }

  async decrement(code, qty) {
    const session = await mongoose.startSession();
    try {
      let updated;
      await session.withTransaction(async () => {
        updated = await InventoryRepo.decrementStock(code, qty, session);
        if (!updated) throw new Error('Insufficient stock');
      });
      session.endSession();
      return updated;
    } catch (err) {
      session.endSession();
      throw err;
    }
  }

  async increment(code, qty) {
    return InventoryRepo.incrementStock(code, qty);
  }

  async bulkAdjust(updates) {
    // updates: [{ itemCode, qtyDelta }]
    return InventoryRepo.bulkAdjust(updates);
  }

  async lowStock() {
    return InventoryRepo.itemsBelowThreshold();
  }

  async linkSupplier(supplierId, itemCode) {
    const item = await InventoryRepo.findByItemCode(itemCode);
    if (!item) throw new Error('Item not found');
    return SuppliersRepo.addSuppliedItem(supplierId, item._id);
  }
}

module.exports = new InventoryService();
