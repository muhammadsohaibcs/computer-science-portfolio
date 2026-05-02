/**
 * rooms.service.js
 *
 * - Business logic for room assignment and release with transactions
 * - Concurrency-safe assign (repos use atomic findOneAndUpdate)
 */

const mongoose = require('mongoose');
const RoomsRepo = require('../repositories/rooms.repo');
const logger = require('../utils/logger');

class RoomsService {
  async create(data) {
    return RoomsRepo.create(data);
  }

  async list({ page = 1, limit = 20, departmentId = null, type = null, status = null } = {}) {
    const filter = {};
    if (departmentId) filter.department = departmentId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    // Get total count for pagination
    const totalItems = await RoomsRepo.count(filter);
    const data = await RoomsRepo.find(filter, null, { page, limit });
    
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

  /**
   * Assign room to patient safely. Uses repo's atomic update; transaction is optional.
   */
  async assign(roomId, patientId, performedBy) {
    // For complex flows (bill creation + room assign) start session in caller.
    const updated = await RoomsRepo.assignRoom(roomId, patientId);
    if (!updated) throw new Error('Room is not available');
    logger.info({ roomId, patientId, performedBy }, 'Room assigned');
    return updated;
  }

  async release(roomId, performedBy) {
    const updated = await RoomsRepo.releaseRoom(roomId);
    logger.info({ roomId, performedBy }, 'Room released');
    return updated;
  }
}

module.exports = new RoomsService();
