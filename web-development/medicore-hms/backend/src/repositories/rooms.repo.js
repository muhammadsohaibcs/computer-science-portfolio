/**
 * src/repositories/rooms.repo.js
 *
 * Handles all Room DB operations:
 * - CRUD via BaseRepository
 * - Atomic assign/release (concurrency safe)
 * - Availability queries
 * - Department-wise listing
 * - Transaction support (session)
 */

const BaseRepository = require('./base.repo');
const Room = require('../models/room.model');

class RoomsRepository extends BaseRepository {
  constructor() {
    super(Room);
  }

  /**
   * Find available rooms by type (General, Private, ICU, Operation)
   */
  async findAvailableByType(type, limit = 10) {
    return this.model
      .find({ type, status: 'Available' })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Assign a room to a patient.
   * Concurrency-safe using findOneAndUpdate with status=Available.
   */
  async assignRoom(roomId, patientId, session = null) {
    const filter = { _id: roomId, status: 'Available' };
    const update = { $set: { assignedPatient: patientId, status: 'Occupied' } };
    const opts = { new: true };
    if (session) opts.session = session;

    // Only returns a document if room was actually "Available"
    return this.model.findOneAndUpdate(filter, update, opts).lean().exec();
  }

  /**
   * Release a room back to Available state
   */
  async releaseRoom(roomId, session = null) {
    const update = { $set: { assignedPatient: null, status: 'Available' } };
    const opts = { new: true };
    if (session) opts.session = session;

    return this.model.findByIdAndUpdate(roomId, update, opts).lean().exec();
  }

  /**
   * List rooms by department
   */
  async listByDepartment(departmentId, options = {}) {
    return this.find({ department: departmentId }, null, options);
  }

  /**
   * Explain query performance (Lab 07/08)
   */
  async explainRooms(filter = {}) {
    return this.explainQuery(filter);
  }
}

module.exports = new RoomsRepository();
