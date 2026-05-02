const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  deviceInfo: { type: String },
  ip: { type: String },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin','Doctor','Nurse','Receptionist','Patient','Lab Technician','Pharmacist','HOD'],
    required: true,
    index: true
  },
  email: { type: String, sparse: true, index: true },
  profilePictureUrl: { type: String },

  // ─── 2FA fields ───────────────────────────────────────────────
  twoFactorEnabled:       { type: Boolean, default: false },
  twoFactorSecret:        { type: String, select: false },   // active TOTP secret (encrypted at rest recommended)
  twoFactorPendingSecret: { type: String, select: false },   // unconfirmed secret during setup

  // Optional domain object link
  profileRef: {
    kind: { type: String, enum: ['Doctor','Staff','Patient'], default: null },
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'profileRef.kind' }
  },
  refreshTokens: [refreshTokenSchema],
  status: { type: String, enum: ['Active','Inactive'], default: 'Active', index: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.index({ role: 1, username: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'refreshTokens.tokenHash': 1 });
userSchema.index({ 'refreshTokens.expiresAt': 1 });

module.exports = mongoose.model('User', userSchema);
