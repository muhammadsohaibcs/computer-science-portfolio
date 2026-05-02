/**
 * medical-records.repo.js
 *
 * MedicalRecord operations: query by patient, append attachments, transactional creation.
 */

const BaseRepository = require('./base.repo');
const MedicalRecord = require('../models/medical-record.model');

class MedicalRecordsRepository extends BaseRepository {
  constructor() {
    super(MedicalRecord);
  }

  async findByPatient(patientId, options = {}) {
    return this.find({ patient: patientId }, null, options);
  }

  async addAttachment(recordId, attachmentMeta, session = null) {
    return this.model.findByIdAndUpdate(recordId, { $push: { attachments: attachmentMeta } }, { new: true, session }).lean().exec();
  }

  // Create record and push ref into patient inside a single transaction when a session is provided
  async createAndLinkToPatient(recordData, patientId, session) {
    if (!session) {
      const rec = await this.create(recordData);
      const Patient = require('../models/patient.model');
      await Patient.findByIdAndUpdate(patientId, { $push: { medicalRecords: rec._id } }).exec();
      return rec;
    }
    // within transaction: create record and push into patient
    const recs = await this.model.create([recordData], { session });
    const rec = recs[0];
    const Patient = require('../models/patient.model');
    await Patient.findByIdAndUpdate(patientId, { $push: { medicalRecords: rec._id } }, { session }).exec();
    return rec;
  }
}

module.exports = new MedicalRecordsRepository();
// medical records repo