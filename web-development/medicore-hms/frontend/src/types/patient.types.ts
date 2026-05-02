/**
 * Patient Types
 * Defines types for patient data structures
 */

/**
 * Patient contact information
 */
export interface PatientContact {
  phone: string;
  email: string;
  address: string;
}

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

/**
 * Patient entity from the backend
 */
export interface Patient {
  _id: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: PatientContact;
  emergencyContact: EmergencyContact;
  medicalRecords: string[];
  primaryDoctor: string | { _id: string; name: string; specialization: string[] };
  bloodGroup?: string;
  medicalHistory?: string[];
  allergies?: string[];
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v: number; // Version field for optimistic locking
}

/**
 * Patient form data for create/update operations
 */
export interface PatientFormData {
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  contact: PatientContact;
  emergencyContact: EmergencyContact;
  primaryDoctor: string;
  bloodGroup?: string;
  medicalHistory?: string[];
  allergies?: string[];
  notes?: string;
  version?: number; // Optional version for optimistic locking on updates
}

/**
 * Patient list query parameters
 */
export interface PatientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
