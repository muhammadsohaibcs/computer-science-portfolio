/**
 * Departments API Module
 * Handles all department-related API calls
 */

import { PaginatedResponse } from '../types/api.types';
import { Department, DepartmentFormData, DepartmentQueryParams } from '../types/department.types';
import apiClient from './client';

/**
 * Fetches a list of departments with optional search
 * @param params - Query parameters (page, limit, q)
 * @returns Promise with paginated department list
 * @throws ApiError if the request fails
 */
export async function getDepartments(params?: DepartmentQueryParams): Promise<PaginatedResponse<Department>> {
  const response = await apiClient.get<PaginatedResponse<Department>>('/api/departments', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single department by ID
 * @param id - Department ID
 * @returns Promise with department data
 * @throws ApiError if the request fails
 */
export async function getDepartmentById(id: string): Promise<Department> {
  const response = await apiClient.get<Department>(`/api/departments/${id}`);
  return response.data;
}

/**
 * Creates a new department
 * @param data - Department form data
 * @returns Promise with created department
 * @throws ApiError if the request fails
 */
export async function createDepartment(data: DepartmentFormData): Promise<Department> {
  const response = await apiClient.post<Department>('/api/departments', data);
  return response.data;
}

/**
 * Updates an existing department
 * @param id - Department ID
 * @param data - Department form data
 * @returns Promise with updated department
 * @throws ApiError if the request fails
 */
export async function updateDepartment(id: string, data: DepartmentFormData): Promise<Department> {
  const response = await apiClient.put<Department>(`/api/departments/${id}`, data);
  return response.data;
}

/**
 * Deletes a department
 * @param id - Department ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`/api/departments/${id}`);
}
