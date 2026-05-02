/**
 * services.repo.js
 *
 * CRUD and search for hospital services (X-Ray, Consultation, etc.)
 */

const BaseRepository = require('./base.repo');
const Service = require('../models/service.model');

class ServicesRepository extends BaseRepository {
  constructor() {
    super(Service);
  }

  async findByCode(code) {
    return this.model.findOne({ code }).lean().exec();
  }

  async listAll(limit = 100) {
    return this.find({}, null, { limit });
  }

  async searchByName(name, limit = 50) {
    return this.model.find({ name: new RegExp(name, 'i') }).limit(limit).lean().exec();
  }
}

module.exports = new ServicesRepository();
