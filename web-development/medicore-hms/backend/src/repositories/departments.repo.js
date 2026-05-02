/**
 * src/repositories/departments.repo.js
 *
 * Repository for Department domain.
 * - Unique code search
 * - List with optional name search
 * - Explain helper for lab performance tests
 */

const BaseRepository = require('./base.repo');
const Department = require('../models/department.model');

class DepartmentsRepository extends BaseRepository {
  constructor() {
    super(Department);
  }

  async findByCode(code) {
    return this.model.findOne({ code }).lean().exec();
  }

  async findByName(name, limit = 50) {
    return this.model.find({ name: new RegExp(name, 'i') }).limit(limit).lean().exec();
  }

  async listAll(options = {}) {
    return this.find({}, null, options);
  }

  // Aggregation example: department counts by head/staff (example aggregation)
  async statsDepartmentCounts() {
    return this.model.aggregate([
      { $lookup: { from: 'staffs', localField: '_id', foreignField: 'department', as: 'staff' } },
      { $project: { name: 1, staffCount: { $size: '$staff' } } },
      { $sort: { staffCount: -1 } }
    ]).exec();
  }
}

module.exports = new DepartmentsRepository();
