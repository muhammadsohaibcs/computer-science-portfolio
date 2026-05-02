/**
 * src/repositories/insurance.repo.js
 *
 * Repository for Insurance policies.
 *
 * Features:
 * - CRUD via BaseRepository
 * - Search by provider + policy number
 * - List by patient
 * - Pagination support
 * - Explain helper for performance analysis (Lab 07/08)
 */

const BaseRepository = require('./base.repo');
const Insurance = require('../models/insurance.model');

class InsuranceRepository extends BaseRepository {
  constructor() {
    super(Insurance);
  }

  // Find insurance policy by provider + policyNumber
  async findByPolicy(providerName, policyNumber) {
    return this.model.findOne({ providerName, policyNumber }).lean().exec();
  }

  // List policies for a specific patient
  async findByPatient(patientId, options = {}) {
    return this.find({ patient: patientId }, null, options);
  }

  // Search provider by name
  async searchProvider(name, limit = 50) {
    return this.model.find({ providerName: new RegExp(name, 'i') }).limit(limit).lean().exec();
  }

  // Explain helper for index evaluation
  async explainInsurance(filter = {}) {
    return this.explainQuery(filter);
  }
}

module.exports = new InsuranceRepository();
