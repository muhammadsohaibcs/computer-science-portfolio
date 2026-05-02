/**
 * staff.service.js
 *
 * - Manage staff members and department listings
 */

const StaffRepo = require('../repositories/staff.repo');
const logger = require('../utils/logger');

class StaffService {
  async create(data) {
    return StaffRepo.create(data);
  }

  async list({ page = 1, limit = 20, department = null, roleTitle = null, q = null } = {}) {
    const filter = {};
    if (department) filter.department = department;
    if (roleTitle) filter.roleTitle = roleTitle;
    if (q) filter.name = new RegExp(q, 'i');
    
    // Get total count for pagination
    const totalItems = await StaffRepo.count(filter);
    const data = await StaffRepo.find(filter, null, { page, limit });
    
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

  async listByDepartment(deptId, options = {}) {
    return StaffRepo.listByDepartment(deptId, options);
  }

  async getByUser(userId) {
    return StaffRepo.findByUserId(userId);
  }

  async get(id) {
    return StaffRepo.findById(id);
  }

  async update(id, data) {
    return StaffRepo.updateById(id, data);
  }

  async remove(id) {
    return StaffRepo.deleteById(id);
  }
}

module.exports = new StaffService();
