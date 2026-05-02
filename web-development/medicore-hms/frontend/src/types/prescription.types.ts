/**
 * Prescription Types
 * Type definitions for prescription-related data
 */

/**
 * Prescription interface representing a medical prescription
 */
export interface Prescription {
  _id: string;
  patient: string;
  doctor: string;
  drugs: {
    name: string;
    dose: string;
    qty: number;
    instructions: string;
  }[];
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/updating prescriptions
 * Omits auto-generated fields
 */
export interface PrescriptionFormData
  extends Omit<Prescription, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'> {}

/**
 * Query parameters for fetching prescriptions
 */
export interface PrescriptionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  patient?: string;
  doctor?: string;
}
