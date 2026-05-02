/**
 * Doctors API Module
 * Handles all doctor-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { Doctor, DoctorFormData, DoctorQueryParams } from '../types/doctor.types';
import apiClient from './client';

/**
 * Fetches a paginated list of doctors with optional search
 * @param params - Query parameters (page, limit, search)
 * @returns Promise with paginated doctor list
 * @throws ApiError if the request fails
 */
export async function getDoctors(params?: DoctorQueryParams): Promise<PaginatedResponse<Doctor>> {
  const response = await apiClient.get<PaginatedResponse<Doctor>>('/api/doctors', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single doctor by ID
 * @param id - Doctor ID
 * @returns Promise with doctor data
 * @throws ApiError if the request fails
 */
export async function getDoctorById(id: string): Promise<Doctor> {
  const response = await apiClient.get<ApiResponse<Doctor>>(`/api/doctors/${id}`);
  return response.data.data;
}

/**
 * Creates a new doctor
 * @param data - Doctor form data
 * @returns Promise with created doctor
 * @throws ApiError if the request fails
 */
export async function createDoctor(data: DoctorFormData): Promise<Doctor> {
  const response = await apiClient.post<ApiResponse<Doctor>>('/api/doctors', data);
  return response.data.data;
}

/**
 * Updates an existing doctor
 * @param id - Doctor ID
 * @param data - Doctor form data
 * @returns Promise with updated doctor
 * @throws ApiError if the request fails
 */
export async function updateDoctor(id: string, data: DoctorFormData): Promise<Doctor> {
  const response = await apiClient.put<ApiResponse<Doctor>>(`/api/doctors/${id}`, data);
  return response.data.data;
}

/**
 * Deletes a doctor
 * @param id - Doctor ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteDoctor(id: string): Promise<void> {
  await apiClient.delete(`/api/doctors/${id}`);
}
