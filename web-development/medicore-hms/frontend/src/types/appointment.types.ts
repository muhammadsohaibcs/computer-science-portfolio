/**
 * Appointment Types
 * Defines types for appointment data structures
 */

/**
 * Appointment status types
 */
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';

/**
 * Appointment entity from the backend
 */
export interface Appointment {
  _id: string;
  patient: string;
  doctor: string;
  appointmentDate: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Appointment form data for create/update operations
 */
export interface AppointmentFormData {
  patient: string;
  doctor: string;
  appointmentDate: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string;
}

/**
 * Appointment list query parameters
 */
export interface AppointmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  patient?: string;
  doctor?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Doctor availability time slot
 */
export interface TimeSlot {
  time: string;
  available: boolean;
}

/**
 * Conflict error response from backend
 */
export interface AppointmentConflictError {
  message: string;
  conflictingAppointment?: Appointment;
}
