/**
 * Prescriptions API Module
 * Handles all prescription-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import {
    Prescription,
    PrescriptionFormData,
    PrescriptionQueryParams,
} from '../types/prescription.types';
import apiClient from './client';

/**
 * Fetches a paginated list of prescriptions with optional filters
 * @param params - Query parameters (page, limit, search, patient, doctor)
 * @returns Promise with paginated prescription list
 * @throws ApiError if the request fails
 */
export async function getPrescriptions(
  params?: PrescriptionQueryParams
): Promise<PaginatedResponse<Prescription>> {
  const response = await apiClient.get<PaginatedResponse<Prescription>>('/api/prescriptions', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single prescription by ID
 * @param id - Prescription ID
 * @returns Promise with prescription data
 * @throws ApiError if the request fails
 */
export async function getPrescriptionById(id: string): Promise<Prescription> {
  const response = await apiClient.get<ApiResponse<Prescription>>(`/api/prescriptions/${id}`);
  return response.data.data;
}

/**
 * Creates a new prescription
 * @param data - Prescription form data
 * @returns Promise with created prescription
 * @throws ApiError if the request fails
 */
export async function createPrescription(data: PrescriptionFormData): Promise<Prescription> {
  const response = await apiClient.post<ApiResponse<Prescription>>('/api/prescriptions', data);
  return response.data.data;
}

/**
 * Updates an existing prescription
 * @param id - Prescription ID
 * @param data - Prescription form data
 * @returns Promise with updated prescription
 * @throws ApiError if the request fails
 */
export async function updatePrescription(
  id: string,
  data: PrescriptionFormData
): Promise<Prescription> {
  const response = await apiClient.put<ApiResponse<Prescription>>(
    `/api/prescriptions/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Deletes a prescription
 * @param id - Prescription ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deletePrescription(id: string): Promise<void> {
  await apiClient.delete(`/api/prescriptions/${id}`);
}
