/**
 * Doctor Types
 * Defines types for doctor data structures
 */

/**
 * Doctor contact information
 */
export interface DoctorContact {
  phone: string;
  email: string;
}

/**
 * Doctor availability schedule
 */
export interface DoctorAvailability {
  weekdays: number[];
  startTime: string;
  endTime: string;
}

/**
 * Doctor entity from the backend
 */
export interface Doctor {
  _id: string;
  name: string;
  specialization: string[];
  user?: string;
  bio?: string;
  contact: DoctorContact;
  availability: DoctorAvailability;
  createdAt: string;
  updatedAt: string;
}

/**
 * Doctor form data for create/update operations
 */
export interface DoctorFormData {
  name: string;
  specialization: string[];
  user?: string;
  bio?: string;
  contact: DoctorContact;
  availability: DoctorAvailability;
}

/**
 * Doctor list query parameters
 */
export interface DoctorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
