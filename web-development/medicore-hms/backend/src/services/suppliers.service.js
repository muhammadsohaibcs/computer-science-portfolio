
/**
 * suppliers.service.js
 *
 * - Manage suppliers and link to inventory items
 */

const SuppliersRepo = require('../repositories/suppliers.repo');
const InventoryRepo = require('../repositories/inventory.repo');

class SuppliersService {
  async create(data) {
    return SuppliersRepo.create(data);
  }

  async list({ page = 1, limit = 20, q = null } = {}) {
    const filter = {};
    if (q) filter.name = new RegExp(q, 'i');
    
    // Get total count for pagination
    const totalItems = await SuppliersRepo.count(filter);
    const data = await SuppliersRepo.find(filter, null, { page, limit });
    
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

  async addSuppliedItem(supplierId, itemCode) {
    const item = await InventoryRepo.findByItemCode(itemCode);
    if (!item) throw new Error('Inventory item not found');
    return SuppliersRepo.addSuppliedItem(supplierId, item._id);
  }

  async get(id) {
    return SuppliersRepo.findById(id);
  }
}

module.exports = new SuppliersService();
