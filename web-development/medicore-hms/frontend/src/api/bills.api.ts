/**
 * Bills API Module
 * Handles all billing-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { Bill, BillFormData, BillQueryParams } from '../types/bill.types';
import apiClient from './client';

/**
 * Fetches a paginated list of bills with optional filters
 * @param params - Query parameters (page, limit, search, patient, paid)
 * @returns Promise with paginated bill list
 * @throws ApiError if the request fails
 */
export async function getBills(params?: BillQueryParams): Promise<PaginatedResponse<Bill>> {
  const response = await apiClient.get<PaginatedResponse<Bill>>('/api/bills', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single bill by ID
 * @param id - Bill ID
 * @returns Promise with bill data
 * @throws ApiError if the request fails
 */
export async function getBillById(id: string): Promise<Bill> {
  const response = await apiClient.get<ApiResponse<Bill>>(`/api/bills/${id}`);
  return response.data.data;
}

/**
 * Creates a new bill
 * @param data - Bill form data
 * @returns Promise with created bill
 * @throws ApiError if the request fails
 */
export async function createBill(data: BillFormData): Promise<Bill> {
  const response = await apiClient.post<ApiResponse<Bill>>('/api/bills', data);
  return response.data.data;
}

/**
 * Updates an existing bill
 * @param id - Bill ID
 * @param data - Bill form data
 * @returns Promise with updated bill
 * @throws ApiError if the request fails
 */
export async function updateBill(id: string, data: BillFormData): Promise<Bill> {
  const response = await apiClient.put<ApiResponse<Bill>>(`/api/bills/${id}`, data);
  return response.data.data;
}

/**
 * Deletes a bill
 * @param id - Bill ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteBill(id: string): Promise<void> {
  await apiClient.delete(`/api/bills/${id}`);
}
