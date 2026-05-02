/**
 * records.service.js
 *
 * - Manage medical records: listing, attachments, retrieval
 */

const MedicalRecordsRepo = require('../repositories/medical-records.repo');
const logger = require('../utils/logger');

class RecordsService {
  async list({ page = 1, limit = 20, search = null } = {}) {
    const filter = {};
    if (search) {
      filter.$or = [
        { diagnosis: { $regex: search, $options: 'i' } },
        { treatment: { $regex: search, $options: 'i' } },
        { observations: { $regex: search, $options: 'i' } }
      ];
    }
    
    const totalItems = await MedicalRecordsRepo.count(filter);
    const data = await MedicalRecordsRepo.find(filter, null, { page, limit });
    
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
    return MedicalRecordsRepo.findByPatient(patientId, options);
  }

  async get(id) {
    return MedicalRecordsRepo.findById(id);
  }

  async create(data) {
    return MedicalRecordsRepo.create(data);
  }

  async update(id, data) {
    return MedicalRecordsRepo.updateById(id, data);
  }

  async remove(id) {
    return MedicalRecordsRepo.deleteById(id);
  }

  async addAttachment(recordId, attachment, userId, session = null) {
    // attachment = { filename, url, uploadedBy: userId, uploadedAt }
    attachment.uploadedBy = userId;
    attachment.uploadedAt = new Date();
    return MedicalRecordsRepo.addAttachment(recordId, attachment, session);
  }
}

module.exports = new RecordsService();
