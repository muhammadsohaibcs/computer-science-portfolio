/**
 * Staff Types
 * Defines types for staff data structures
 */

/**
 * Staff role types
 */
export type StaffRole = 'Nurse' | 'Receptionist' | 'Lab Technician' | 'Pharmacist';

/**
 * Staff entity from the backend
 */
export interface Staff {
  _id: string;
  name: string;
  roleTitle?: string;
  department?: string;
  user?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Staff form data for create/update operations
 */
export interface StaffFormData {
  name: string;
  roleTitle?: string;
  department?: string;
  user?: string;
}

/**
 * Staff list query parameters
 */
export interface StaffQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  department?: string;
}
