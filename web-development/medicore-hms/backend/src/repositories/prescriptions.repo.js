// prescriptions repo
/**
 * prescriptions.repo.js
 *
 * Prescription repository:
 * - CRUD via BaseRepository
 * - List by patient
 * - Mark as fulfilled
 * - Full-text search on drugs (basic regex)
 * - Transaction-ready updates
 */

const BaseRepository = require('./base.repo');
const Prescription = require('../models/prescription.model');

class PrescriptionsRepository extends BaseRepository {
  constructor() {
    super(Prescription);
  }

  // Create prescription for a patient
  async createForPatient(data, session = null) {
    return this.create(data, session);
  }

  // List all prescriptions with pagination
  async findAll(options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    let filter = {};
    
    // Add search functionality if provided
    if (options.search) {
      filter = {
        $or: [
          { 'drugs.name': new RegExp(options.search, 'i') },
          { notes: new RegExp(options.search, 'i') }
        ]
      };
    }

    const [data, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort(sort).lean().exec(),
      this.model.countDocuments(filter).exec()
    ]);

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

  // List prescriptions for a patient
  async findByPatient(patientId, options = {}) {
    return this.find({ patient: patientId }, null, options);
  }

  // Fulfill prescription
  async markFulfilled(id, userId, session = null) {
    const update = {
      $set: {
        fulfilled: true,
        fulfilledBy: userId,
        fulfilledAt: new Date()
      }
    };
    const opts = { new: true };
    if (session) opts.session = session;

    return this.model.findByIdAndUpdate(id, update, opts).lean().exec();
  }

  // Search prescriptions by drug name
  async searchDrug(name, limit = 50) {
    return this.model.find({ 'drugs.name': new RegExp(name, 'i') }).limit(limit).lean().exec();
  }

  // Explain helper
  async explainPrescriptions(filter = {}) {
    return this.explainQuery(filter);
  }
}

module.exports = new PrescriptionsRepository();
