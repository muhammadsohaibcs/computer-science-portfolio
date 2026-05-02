/**
 * services.service.js
 *
 * Manage hospital services (X-Ray, Consultation, Lab Tests)
 */

const ServicesRepo = require('../repositories/services.repo');
const { metaFor } = require('../utils/pagination');

class HospitalServicesService {
  async create(data) { return ServicesRepo.create(data); }
  
  async list({ page = 1, limit = 20, search = null, department = null, category = null } = {}) {
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    if (department) filter.department = department;
    if (category) filter.category = category;
    
    const data = await ServicesRepo.find(filter, null, { page, limit });
    const total = await ServicesRepo.count(filter);
    
    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }
  
  async get(id) { return ServicesRepo.findById(id); }
  async findByCode(code) { return ServicesRepo.findByCode(code); }
  async update(id, data) { return ServicesRepo.updateById(id, data); }
  async remove(id) { return ServicesRepo.deleteById(id); }
}

module.exports = new HospitalServicesService();
