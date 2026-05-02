const mongoose = require('mongoose');

const InsuranceSchema = new mongoose.Schema(
  {
    providerName: { type: String, required: true },
    policyNumber: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },

    validFrom: { type: Date },
    validTo: { type: Date },

    details: { type: Object }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Insurance', InsuranceSchema);
