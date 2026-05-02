/**
 * Medical Records API Module
 * Handles all medical record-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import {
    MedicalRecord,
    MedicalRecordFormData,
    MedicalRecordQueryParams,
} from '../types/medical-record.types';
import apiClient from './client';

/**
 * Fetches a paginated list of medical records with optional filters
 * @param params - Query parameters (page, limit, search, patient, doctor, startDate, endDate)
 * @returns Promise with paginated medical record list
 * @throws ApiError if the request fails
 */
export async function getMedicalRecords(
  params?: MedicalRecordQueryParams
): Promise<PaginatedResponse<MedicalRecord>> {
  const response = await apiClient.get<PaginatedResponse<MedicalRecord>>('/api/records', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single medical record by ID
 * @param id - Medical record ID
 * @returns Promise with medical record data
 * @throws ApiError if the request fails
 */
export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  const response = await apiClient.get<ApiResponse<MedicalRecord>>(`/api/records/${id}`);
  return response.data.data;
}

/**
 * Creates a new medical record
 * @param data - Medical record form data
 * @returns Promise with created medical record
 * @throws ApiError if the request fails
 */
export async function createMedicalRecord(data: MedicalRecordFormData): Promise<MedicalRecord> {
  const response = await apiClient.post<ApiResponse<MedicalRecord>>('/api/records', data);
  return response.data.data;
}

/**
 * Updates an existing medical record
 * @param id - Medical record ID
 * @param data - Medical record form data
 * @returns Promise with updated medical record
 * @throws ApiError if the request fails
 */
export async function updateMedicalRecord(
  id: string,
  data: MedicalRecordFormData
): Promise<MedicalRecord> {
  const response = await apiClient.put<ApiResponse<MedicalRecord>>(
    `/api/records/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Deletes a medical record
 * @param id - Medical record ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteMedicalRecord(id: string): Promise<void> {
  await apiClient.delete(`/api/records/${id}`);
}
