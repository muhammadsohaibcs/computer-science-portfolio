/**
 * lab-results.service.js
 *
 * - Create lab result records
 * - Add attachments metadata (file storage external)
 * - Query by patient and test
 */

const mongoose = require('mongoose');
const LabResultsRepo = require('../repositories/lab-results.repo');
const logger = require('../utils/logger');

class LabResultsService {
  async create(data, performedBy) {
    data.performedBy = performedBy;
    data.performedAt = data.performedAt || new Date();
    return LabResultsRepo.create(data);
  }

  async addAttachment(resultId, attachment, uploadedBy) {
    attachment.uploadedBy = uploadedBy;
    attachment.uploadedAt = new Date();
    return LabResultsRepo.addAttachment(resultId, attachment);
  }

  async list(options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const filter = {};
    
    const totalItems = await LabResultsRepo.count(filter);
    const data = await LabResultsRepo.find(filter, null, { page, limit });
    
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

  async listByPatient(patientId, options = {}) {
    return LabResultsRepo.findByPatient(patientId, options);
  }

  async searchTest(testName, limit = 50) {
    return LabResultsRepo.searchTest(testName, limit);
  }
}

module.exports = new LabResultsService();
