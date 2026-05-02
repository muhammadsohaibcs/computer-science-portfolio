/**
 * departments.service.js
 *
 * - CRUD and stats
 */

const DepartmentsRepo = require('../repositories/departments.repo');
const logger = require('../utils/logger');

class DepartmentsService {
  async create(data) {
    const existing = await DepartmentsRepo.findByCode(data.code);
    if (existing) throw new Error('Department code already exists');
    return DepartmentsRepo.create(data);
  }

  async list({ page = 1, limit = 20 } = {}) {
    const filter = {};
    
    // Get total count for pagination
    const totalItems = await DepartmentsRepo.count(filter);
    const data = await DepartmentsRepo.find(filter, null, { page, limit });
    
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
    return DepartmentsRepo.findById(id);
  }

  async stats() {
    return DepartmentsRepo.statsDepartmentCounts();
  }
}

module.exports = new DepartmentsService();
