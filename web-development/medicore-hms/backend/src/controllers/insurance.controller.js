const asyncHandler = require('../middleware/async-handler');
const { checkPermission } = require('../middleware/permissions.middleware');
const InsuranceService = require('../services/insurance.service');
const InsuranceRepo = require('../repositories/insurance.repo');

// CREATE insurance policy
exports.create = [
  checkPermission('insurance:create'),
  asyncHandler(async (req, res) => {
    const created = await InsuranceService.create(req.body);
    res.status(201).json(created);
  })
];

// LIST all insurance policies with pagination
exports.list = [
  checkPermission('insurance:view'),
  asyncHandler(async (req, res) => {
    const result = await InsuranceService.list({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search
    });
    res.json(result);
  })
];

// LIST policies for a patient
exports.listByPatient = [
  checkPermission('insurance:view'),
  asyncHandler(async (req, res) => {
    const data = await InsuranceService.listByPatient(req.params.patientId);
    res.json(data);
  })
];

// VALIDATE policy
exports.validate = [
  checkPermission('insurance:validate'),
  asyncHandler(async (req, res) => {
    const result = await InsuranceService.validate(
      req.body.providerName,
      req.body.policyNumber
    );
    res.json(result);
  })
];

// GET one policy by ID
exports.get = [
  checkPermission('insurance:view'),
  asyncHandler(async (req, res) => {
    const policy = await InsuranceRepo.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Not found' });
    res.json(policy);
  })
];

// UPDATE
exports.update = [
  checkPermission('insurance:update'),
  asyncHandler(async (req, res) => {
    const updated = await InsuranceRepo.updateById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  })
];

// DELETE
exports.remove = [
  checkPermission('insurance:delete'),
  asyncHandler(async (req, res) => {
    await InsuranceRepo.deleteById(req.params.id);
    res.json({ ok: true });
  })
];
