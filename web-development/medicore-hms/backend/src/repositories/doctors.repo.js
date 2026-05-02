/**
 * doctors.repo.js
 *
 * Doctor-specific DB operations:
 * - Find by specialization
 * - Search by availability
 */

const BaseRepository = require('./base.repo');
const Doctor = require('../models/doctor.model');

class DoctorsRepository extends BaseRepository {
  constructor() {
    super(Doctor);
  }

  async findBySpecialization(spec) {
    return Doctor.find({ specialization: spec }).sort({ name: 1 }).lean().exec();
  }

  async getProfileWithUser(id) {
    return Doctor.findById(id).populate('user').populate('department').lean().exec();
  }

  async searchByName(name, limit = 50) {
    return this.model.find({ name: new RegExp(name, 'i') }).limit(limit).lean().exec();
  }
}

module.exports = new DoctorsRepository();
