/**
 * doctors.service.js
 * - Manage doctor profiles, search by specialization, availability helpers
 */

const DoctorsRepo = require('../repositories/doctors.repo');
const logger = require('../utils/logger');

class DoctorsService {
  async create(data) {
    return DoctorsRepo.create(data);
  }

  async get(id) {
    return DoctorsRepo.getProfileWithUser(id);
  }

  async list({ page = 1, limit = 20, q = null, specialization = null } = {}) {
    const filter = {};
    if (specialization) filter.specialization = specialization;
    if (q) filter.name = new RegExp(q, 'i');
    if (process.env.DEBUG_EXPLAIN === 'true') {
      const e = await DoctorsRepo.explainQuery(filter).catch(() => null);
      logger.info({ explain: e }, 'Doctors list explain');
    }
    
    // Get total count for pagination
    const totalItems = await DoctorsRepo.count(filter);
    const data = await DoctorsRepo.find(filter, null, { page, limit });
    
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

  async search({ specialization = null, q = null, limit = 50 } = {}) {
    const filter = {};
    if (specialization) filter.specialization = specialization;
    if (q) filter.name = new RegExp(q, 'i');
    if (process.env.DEBUG_EXPLAIN === 'true') {
      const e = await DoctorsRepo.explainQuery(filter).catch(() => null);
      logger.info({ explain: e }, 'Doctors search explain');
    }
    return DoctorsRepo.find(filter, null, { limit });
  }

  async update(id, data) {
    return DoctorsRepo.updateById(id, data);
  }
}

module.exports = new DoctorsService();
