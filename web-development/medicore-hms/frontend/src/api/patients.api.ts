/**
 * Patients API Module
 * Handles all patient-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { Patient, PatientFormData, PatientQueryParams } from '../types/patient.types';
import apiClient from './client';

/**
 * Fetches a paginated list of patients with optional search
 * @param params - Query parameters (page, limit, search)
 * @returns Promise with paginated patient list
 * @throws ApiError if the request fails
 */
export async function getPatients(params?: PatientQueryParams): Promise<PaginatedResponse<Patient>> {
  const response = await apiClient.get<PaginatedResponse<Patient>>('/api/patients', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single patient by ID
 * @param id - Patient ID
 * @returns Promise with patient data
 * @throws ApiError if the request fails
 */
export async function getPatientById(id: string): Promise<Patient> {
  const response = await apiClient.get<ApiResponse<Patient>>(`/api/patients/${id}`);
  return response.data.data;
}

/**
 * Creates a new patient
 * @param data - Patient form data
 * @returns Promise with created patient
 * @throws ApiError if the request fails
 */
export async function createPatient(data: PatientFormData): Promise<Patient> {
  const response = await apiClient.post<ApiResponse<Patient>>('/api/patients', data);
  return response.data.data;
}

/**
 * Updates an existing patient
 * @param id - Patient ID
 * @param data - Patient form data (should include version for optimistic locking)
 * @returns Promise with updated patient
 * @throws ApiError if the request fails (409 for version conflict)
 */
export async function updatePatient(id: string, data: PatientFormData): Promise<Patient> {
  try {
    const response = await apiClient.put<ApiResponse<Patient>>(`/api/patients/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    // Re-throw with enhanced error info for version conflicts
    if (error.response?.status === 409) {
      throw {
        message: error.response.data.message || 'The patient record has been modified by another user',
        status: 409,
        code: error.response.data.code,
        currentVersion: error.response.data.currentVersion
      };
    }
    throw error;
  }
}

/**
 * Deletes a patient
 * @param id - Patient ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deletePatient(id: string): Promise<void> {
  await apiClient.delete(`/api/patients/${id}`);
}
