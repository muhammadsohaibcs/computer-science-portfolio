/**
 * Lab Result Types
 * Type definitions for lab result-related data
 */

/**
 * Lab result status types
 */
export type LabResultStatus = 'Pending' | 'In Progress' | 'Completed';

/**
 * Lab result interface representing a patient's lab test result
 */
export interface LabResult {
  _id: string;
  patient: string;
  testName: string;
  result?: string;
  normalRange?: string;
  units?: string;
  status: LabResultStatus;
  attachments: {
    filename: string;
    url: string;
  }[];
  performedBy?: string;
  performedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/updating lab results
 * Omits auto-generated fields
 */
export interface LabResultFormData
  extends Omit<LabResult, '_id' | 'createdAt' | 'updatedAt' | 'attachments'> {
  attachments?: File[];
}

/**
 * Query parameters for fetching lab results
 */
export interface LabResultQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  patient?: string;
  performedBy?: string;
  testName?: string;
}

/**
 * File upload progress callback
 */
export interface UploadProgressCallback {
  (progress: number): void;
}
