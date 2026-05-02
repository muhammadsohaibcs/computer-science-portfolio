/**
 * Suppliers API Module
 * Handles all supplier-related API calls
 */

import { PaginatedResponse } from '../types/api.types';
import { Supplier, SupplierFormData, SupplierQueryParams } from '../types/supplier.types';
import apiClient from './client';

/**
 * Fetches a list of suppliers with optional search
 * @param params - Query parameters (page, limit, q)
 * @returns Promise with paginated supplier list
 * @throws ApiError if the request fails
 */
export async function getSuppliers(params?: SupplierQueryParams): Promise<PaginatedResponse<Supplier>> {
  const response = await apiClient.get<PaginatedResponse<Supplier>>('/api/suppliers', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single supplier by ID
 * @param id - Supplier ID
 * @returns Promise with supplier data
 * @throws ApiError if the request fails
 */
export async function getSupplierById(id: string): Promise<Supplier> {
  const response = await apiClient.get<Supplier>(`/api/suppliers/${id}`);
  return response.data;
}

/**
 * Creates a new supplier
 * @param data - Supplier form data
 * @returns Promise with created supplier
 * @throws ApiError if the request fails
 */
export async function createSupplier(data: SupplierFormData): Promise<Supplier> {
  const response = await apiClient.post<Supplier>('/api/suppliers', data);
  return response.data;
}

/**
 * Updates an existing supplier
 * @param id - Supplier ID
 * @param data - Supplier form data
 * @returns Promise with updated supplier
 * @throws ApiError if the request fails
 */
export async function updateSupplier(id: string, data: SupplierFormData): Promise<Supplier> {
  const response = await apiClient.put<Supplier>(`/api/suppliers/${id}`, data);
  return response.data;
}

/**
 * Deletes a supplier
 * @param id - Supplier ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/api/suppliers/${id}`);
}
