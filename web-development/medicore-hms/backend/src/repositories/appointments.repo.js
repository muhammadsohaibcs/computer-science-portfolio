/**
 * appointments.repo.js
 *
 * Appointment repository with:
 * - Doctor schedule lookup
 * - Patient appointment history lookup
 * - Conflict checks and pagination
 */

const BaseRepository = require('./base.repo');
const Appointment = require('../models/appointment.model');

class AppointmentsRepository extends BaseRepository {
  constructor() {
    super(Appointment);
  }

  async getDoctorSchedule(doctorId, start, end) {
    return Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: start, $lte: end }
    }).sort({ appointmentDate: 1 }).lean().exec();
  }

  async getPatientAppointments(patientId, options = {}) {
    return this.find({ patient: patientId }, null, options);
  }

  /**
   * Conflict detection: checks whether doctor has appointment overlapping a window.
   * Simple check: any appointment with appointmentDate between start and end.
   * @param {string} doctorId - Doctor ID
   * @param {Date} start - Start time
   * @param {Date} end - End time
   * @param {string} excludeId - Optional appointment ID to exclude from conflict check (for updates)
   */
  async hasDoctorConflict(doctorId, start, end, excludeId = null) {
    const filter = {
      doctor: doctorId,
      appointmentDate: { $gte: start, $lte: end },
      status: { $ne: 'Cancelled' }
    };
    
    // Exclude specific appointment when checking for updates
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    
    return this.model.exists(filter);
  }

  // Additional: find upcoming appointments for a doctor
  async upcomingForDoctor(doctorId, limit = 20) {
    const now = new Date();
    return this.model.find({ doctor: doctorId, appointmentDate: { $gte: now }, status: { $ne: 'Cancelled' } })
      .sort({ appointmentDate: 1 }).limit(limit).lean().exec();
  }
}

module.exports = new AppointmentsRepository();
