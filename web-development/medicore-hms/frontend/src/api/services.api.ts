/**
 * Services API Module
 * Handles all service-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { Service, ServiceFormData, ServiceQueryParams } from '../types/service.types';
import apiClient from './client';

/**
 * Fetches a paginated list of services with optional filters
 * @param params - Query parameters (page, limit, search, department, category)
 * @returns Promise with paginated service list
 * @throws ApiError if the request fails
 */
export async function getServices(params?: ServiceQueryParams): Promise<PaginatedResponse<Service>> {
  const response = await apiClient.get<PaginatedResponse<Service>>('/api/services', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single service by ID
 * @param id - Service ID
 * @returns Promise with service data
 * @throws ApiError if the request fails
 */
export async function getServiceById(id: string): Promise<Service> {
  const response = await apiClient.get<ApiResponse<Service>>(`/api/services/${id}`);
  return response.data.data;
}

/**
 * Creates a new service
 * @param data - Service form data
 * @returns Promise with created service
 * @throws ApiError if the request fails
 */
export async function createService(data: ServiceFormData): Promise<Service> {
  const response = await apiClient.post<ApiResponse<Service>>('/api/services', data);
  return response.data.data;
}

/**
 * Updates an existing service
 * @param id - Service ID
 * @param data - Service form data
 * @returns Promise with updated service
 * @throws ApiError if the request fails
 */
export async function updateService(id: string, data: ServiceFormData): Promise<Service> {
  const response = await apiClient.put<ApiResponse<Service>>(`/api/services/${id}`, data);
  return response.data.data;
}

/**
 * Deletes a service
 * @param id - Service ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteService(id: string): Promise<void> {
  await apiClient.delete(`/api/services/${id}`);
}
