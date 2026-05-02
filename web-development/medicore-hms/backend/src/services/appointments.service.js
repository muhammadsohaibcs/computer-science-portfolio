/**
 * appointments.service.js
 *
 * Business:
 * - Create appointment with conflict detection (concurrency protection)
 * - Cancel/update appointments
 * - Doctor schedule queries
 *
 * Lab refs: conflict detection & indexing performance: /mnt/data/3. ADB Lab Manual CSC316 ADB.pdf
 */

const mongoose = require('mongoose');
const AppointmentsRepo = require('../repositories/appointments.repo');
const logger = require('../utils/logger');

class AppointmentsService {
  /**
   * Create appointment ensuring no conflict for doctor in same timeslot.
   * appointmentData must contain: patient, doctor, appointmentDate, durationMinutes (opt)
   */
  async create(appointmentData) {
    const { doctor, appointmentDate, durationMinutes = 30 } = appointmentData;
    const start = new Date(appointmentDate);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    // simple conflict check; in high concurrency environments, consider distributed locks
    const conflict = await AppointmentsRepo.hasDoctorConflict(doctor, start, end);
    if (conflict) throw new Error('Doctor has conflict on this timeslot');

    const created = await AppointmentsRepo.create(appointmentData);
    logger.info({ appointmentId: created._id }, 'Appointment created');
    return created;
  }

  async list({ page = 1, limit = 20, patient = null, doctor = null, status = null, startDate = null, endDate = null } = {}) {
    const filter = {};
    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = new Date(startDate);
      if (endDate) filter.appointmentDate.$lte = new Date(endDate);
    }
    
    // Get total count for pagination
    const totalItems = await AppointmentsRepo.count(filter);
    const data = await AppointmentsRepo.find(filter, null, { page, limit, sort: { appointmentDate: 1 } });
    
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

  async get(id) {
    return AppointmentsRepo.findById(id);
  }

  async update(id, data) {
    // Check for conflicts if updating doctor or time
    if (data.doctor || data.appointmentDate) {
      const existing = await AppointmentsRepo.findById(id);
      if (!existing) throw new Error('Appointment not found');
      
      const doctor = data.doctor || existing.doctor;
      const appointmentDate = data.appointmentDate || existing.appointmentDate;
      const durationMinutes = data.durationMinutes || existing.durationMinutes || 30;
      
      const start = new Date(appointmentDate);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      
      // Check for conflicts excluding this appointment
      const conflict = await AppointmentsRepo.hasDoctorConflict(doctor, start, end, id);
      if (conflict) throw new Error('Doctor has conflict on this timeslot');
    }
    
    return AppointmentsRepo.updateById(id, data);
  }

  async remove(id) {
    return AppointmentsRepo.deleteById(id);
  }

  async listDoctor(doctorId, start, end) {
    return AppointmentsRepo.getDoctorSchedule(doctorId, start, end);
  }

  async listPatient(patientId, options = {}) {
    return AppointmentsRepo.getPatientAppointments(patientId, options);
  }

  async cancel(id, reason = null) {
    return AppointmentsRepo.findOneAndUpdate({ _id: id }, { $set: { status: 'Cancelled', cancelledReason: reason } }, { new: true });
  }
}

module.exports = new AppointmentsService();
// appointments service code (placeholder)