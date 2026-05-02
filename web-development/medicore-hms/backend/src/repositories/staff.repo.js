/**
 * staff.repo.js
 *
 * Staff operations: list by department, find by user reference.
 */

const BaseRepository = require('./base.repo');
const Staff = require('../models/staff.model');

class StaffRepository extends BaseRepository {
  constructor() {
    super(Staff);
  }

  async listByDepartment(deptId, options = {}) {
    return this.find({ department: deptId }, null, options);
  }

  async findByUserId(userId) {
    return this.model.findOne({ user: userId }).lean().exec();
  }

  async searchByName(name, limit = 50) {
    return this.model.find({ name: new RegExp(name, 'i') }).limit(limit).lean().exec();
  }
}

module.exports = new StaffRepository();
