/**
 * stats.controller.js
 * 
 * Dashboard statistics endpoint for frontend
 */

const asyncHandler = require('../middleware/async-handler');
const authMiddleware = require('../middleware/auth.middleware');
const { success } = require('../utils/response');

const PatientsRepo = require('../repositories/patients.repo');
const DoctorsRepo = require('../repositories/doctors.repo');
const AppointmentsRepo = require('../repositories/appointments.repo');
const StaffRepo = require('../repositories/staff.repo');
const RoomsRepo = require('../repositories/rooms.repo');

/**
 * GET /api/stats
 * Returns dashboard statistics
 */
exports.getDashboardStats = [
  authMiddleware(),
  asyncHandler(async (req, res) => {
    // Get counts for main entities
    const [
      patientsCount,
      doctorsCount,
      appointmentsCount,
      staffCount,
      totalRooms,
      availableRooms,
      occupiedRooms
    ] = await Promise.all([
      PatientsRepo.count(),
      DoctorsRepo.count(),
      AppointmentsRepo.count(),
      StaffRepo.count(),
      RoomsRepo.count(),
      RoomsRepo.count({ status: 'Available' }),
      RoomsRepo.count({ status: 'Occupied' })
    ]);

    // Get recent appointments for activity feed (optional)
    const recentAppointments = await AppointmentsRepo.find(
      {},
      null,
      { limit: 5, sort: { createdAt: -1 } }
    );

    const recentActivity = recentAppointments.map(apt => ({
      type: 'appointment',
      description: `Appointment scheduled`,
      timestamp: apt.createdAt
    }));

    return success(res, {
      patients: patientsCount,
      doctors: doctorsCount,
      appointments: appointmentsCount,
      staff: staffCount,
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms
      },
      recentActivity
    });
  })
];
