const BaseRepository = require('./base.repo');
const User = require('../models/user.model');

class UsersRepository extends BaseRepository {
  constructor() { super(User); }

  async findByUsername(username) {
    return this.model.findOne({ username }).exec();
  }

  async findById(id) {
    return this.model.findById(id).exec();
  }

  async findByIdWithProjection(id, projection = null) {
    return this.model.findById(id, projection).lean().exec();
  }

  async updatePassword(userId, newPasswordHash) {
    return this.model.findByIdAndUpdate(userId, { passwordHash: newPasswordHash }, { new: true }).exec();
  }

  async addRefreshToken(userId, tokenHash, expiresAt, deviceInfo = null, ip = null, session = null) {
    const update = { $push: { refreshTokens: { tokenHash, expiresAt, deviceInfo, ip, createdAt: new Date() } } };
    const opts = { new: true };
    if (session) opts.session = session;
    return this.model.findByIdAndUpdate(userId, update, opts).exec();
  }

  async removeRefreshToken(tokenHash, session = null) {
    const opts = {};
    if (session) opts.session = session;
    return this.model.updateOne({ 'refreshTokens.tokenHash': tokenHash }, { $pull: { refreshTokens: { tokenHash } } }, opts).exec();
  }

  async revokeAll(userId, session = null) {
    const opts = {};
    if (session) opts.session = session;
    return this.model.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } }, opts).exec();
  }

  async findByRefreshHash(tokenHash) {
    return this.model.findOne({ 'refreshTokens.tokenHash': tokenHash }).exec();
  }

  async listByRole(role, options = {}) {
    return this.find({ role }, null, options);
  }

  // ── 2FA methods ────────────────────────────────────────────────
  async setTwoFAPendingSecret(userId, secret) {
    return this.model.findByIdAndUpdate(
      userId,
      { twoFactorPendingSecret: secret },
      { new: true }
    ).select('+twoFactorPendingSecret').exec();
  }

  async activateTwoFA(userId, secret) {
    return this.model.findByIdAndUpdate(
      userId,
      { twoFactorEnabled: true, twoFactorSecret: secret, twoFactorPendingSecret: null },
      { new: true }
    ).exec();
  }

  async deactivateTwoFA(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      { twoFactorEnabled: false, twoFactorSecret: null, twoFactorPendingSecret: null },
      { new: true }
    ).exec();
  }

  async findByIdWith2FA(id) {
    return this.model.findById(id).select('+twoFactorSecret +twoFactorPendingSecret').exec();
  }

  async explainUsers(filter = {}) {
    return this.explainQuery(filter);
  }
}

module.exports = new UsersRepository();
