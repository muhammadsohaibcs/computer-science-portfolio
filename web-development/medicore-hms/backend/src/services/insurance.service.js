/**
 * insurance.service.js
 *
 * - CRUD policies and validation helpers
 * - Validate policy dates and provider
 */

const InsuranceRepo = require('../repositories/insurance.repo');
const logger = require('../utils/logger');

class InsuranceService {
  async create(data) {
    const existing = await InsuranceRepo.findByPolicy(data.providerName, data.policyNumber);
    if (existing) throw new Error('Policy already exists for provider + number');
    return InsuranceRepo.create(data);
  }

  async list({ page = 1, limit = 20, search = null } = {}) {
    const filter = {};
    if (search) {
      filter.$or = [
        { providerName: { $regex: search, $options: 'i' } },
        { policyNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const totalItems = await InsuranceRepo.count(filter);
    const data = await InsuranceRepo.find(filter, null, { page, limit });
    
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
    return InsuranceRepo.findByPatient(patientId, options);
  }

  async validate(providerName, policyNumber) {
    const policy = await InsuranceRepo.findByPolicy(providerName, policyNumber);
    if (!policy) return { valid: false, reason: 'Not found' };
    const now = new Date();
    if (policy.validFrom && policy.validFrom > now) return { valid: false, reason: 'Not active' };
    if (policy.validTo && policy.validTo < now) return { valid: false, reason: 'Expired' };
    return { valid: true, policyId: policy._id };
  }
}

module.exports = new InsuranceService();
