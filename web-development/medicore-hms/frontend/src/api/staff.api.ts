/**
 * Staff API Module
 * Handles all staff-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { Staff, StaffFormData, StaffQueryParams } from '../types/staff.types';
import apiClient from './client';

/**
 * Fetches a paginated list of staff with optional search and filters
 * @param params - Query parameters (page, limit, search, role, department)
 * @returns Promise with paginated staff list
 * @throws ApiError if the request fails
 */
export async function getStaff(params?: StaffQueryParams): Promise<PaginatedResponse<Staff>> {
  const response = await apiClient.get<PaginatedResponse<Staff>>('/api/staff', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single staff member by ID
 * @param id - Staff ID
 * @returns Promise with staff data
 * @throws ApiError if the request fails
 */
export async function getStaffById(id: string): Promise<Staff> {
  const response = await apiClient.get<ApiResponse<Staff>>(`/api/staff/${id}`);
  return response.data.data;
}

/**
 * Creates a new staff member
 * @param data - Staff form data
 * @returns Promise with created staff member
 * @throws ApiError if the request fails
 */
export async function createStaff(data: StaffFormData): Promise<Staff> {
  const response = await apiClient.post<ApiResponse<Staff>>('/api/staff', data);
  return response.data.data;
}

/**
 * Updates an existing staff member
 * @param id - Staff ID
 * @param data - Staff form data
 * @returns Promise with updated staff member
 * @throws ApiError if the request fails
 */
export async function updateStaff(id: string, data: StaffFormData): Promise<Staff> {
  const response = await apiClient.put<ApiResponse<Staff>>(`/api/staff/${id}`, data);
  return response.data.data;
}

/**
 * Deletes a staff member
 * @param id - Staff ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteStaff(id: string): Promise<void> {
  await apiClient.delete(`/api/staff/${id}`);
}
