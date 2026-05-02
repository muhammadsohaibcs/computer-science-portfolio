// patients repo
/**
 * patients.repo.js
 *
 * Patient domain operations: search by name, load records, pagination helper.
 */

const BaseRepository = require('./base.repo');
const Patient = require('../models/patient.model');

class PatientsRepository extends BaseRepository {
  constructor() {
    super(Patient);
  }

  async searchByNamePrefix(prefix, limit = 20) {
    const q = { name: new RegExp('^' + prefix, 'i') };
    return this.model.find(q).limit(limit).sort({ createdAt: -1 }).lean().exec();
  }

  async getWithRecords(id) {
    // populate with medical records and primary doctor
    return this.model.findById(id).populate('medicalRecords').populate('primaryDoctor').lean().exec();
  }

  async updateContact(id, contactObj, session = null) {
    return this.model.findByIdAndUpdate(id, { $set: { contact: contactObj } }, { new: true, session }).exec();
  }

  // Additional helper: find by phone or email
  async findByContact(phoneOrEmail) {
    return this.model.findOne({
      $or: [
        { 'contact.phone': phoneOrEmail },
        { 'contact.email': phoneOrEmail }
      ]
    }).lean().exec();
  }
}

module.exports = new PatientsRepository();
