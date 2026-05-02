/**
 * Medical Record Types
 * Type definitions for medical record-related data
 */

/**
 * Medical Record interface representing a patient's medical record
 */
export interface MedicalRecord {
  _id: string;
  patient: string;
  doctor: string;
  diagnosis: string;
  treatment: string;
  observations: string;
  visitDate: string;
  appointment?: string;
  prescription?: string;
  labResult?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Form data for creating/updating medical records
 * Omits auto-generated fields
 */
export interface MedicalRecordFormData
  extends Omit<MedicalRecord, '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {}

/**
 * Query parameters for fetching medical records
 */
export interface MedicalRecordQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  patient?: string;
  doctor?: string;
  startDate?: string;
  endDate?: string;
}
