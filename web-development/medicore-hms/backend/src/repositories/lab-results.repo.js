/**
 * src/repositories/lab-results.repo.js
 *
 * Lab Results repository:
 * - CRUD via BaseRepository
 * - Find by patient
 * - Add file attachments
 * - Pagination
 * - Explain helper for Lab 07/08
 */

const BaseRepository = require('./base.repo');
const LabResult = require('../models/lab-result.model');

class LabResultsRepository extends BaseRepository {
  constructor() {
    super(LabResult);
  }

  // Find results belonging to a single patient
  async findByPatient(patientId, options = {}) {
    return this.find({ patient: patientId }, null, options);
  }

  // Add a metadata attachment to a lab result
  async addAttachment(resultId, attachment, session = null) {
    const update = { $push: { attachments: attachment } };
    const opts = { new: true };
    if (session) opts.session = session;

    return this.model.findByIdAndUpdate(resultId, update, opts).lean().exec();
  }

  // Search by test name
  async searchTest(testName, limit = 50) {
    return this.model.find({ testName: new RegExp(testName, 'i') }).limit(limit).lean().exec();
  }

  // Explain helper
  async explainLab(filter = {}) {
    return this.explainQuery(filter);
  }
}

module.exports = new LabResultsRepository();
