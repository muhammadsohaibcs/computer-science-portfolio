/**
 * Inventory API Module
 * Handles all inventory-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { InventoryFormData, InventoryItem, InventoryQueryParams } from '../types/inventory.types';
import apiClient from './client';

/**
 * Fetches a paginated list of inventory items with optional filters
 * @param params - Query parameters (page, limit, search, category, lowStock)
 * @returns Promise with paginated inventory list
 * @throws ApiError if the request fails
 */
export async function getInventoryItems(params?: InventoryQueryParams): Promise<PaginatedResponse<InventoryItem>> {
  const response = await apiClient.get<PaginatedResponse<InventoryItem>>('/api/inventory', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single inventory item by ID
 * @param id - Inventory item ID
 * @returns Promise with inventory item data
 * @throws ApiError if the request fails
 */
export async function getInventoryItemById(id: string): Promise<InventoryItem> {
  const response = await apiClient.get<ApiResponse<InventoryItem>>(`/api/inventory/${id}`);
  return response.data.data;
}

/**
 * Creates a new inventory item
 * @param data - Inventory item form data
 * @returns Promise with created inventory item
 * @throws ApiError if the request fails
 */
export async function createInventoryItem(data: InventoryFormData): Promise<InventoryItem> {
  const response = await apiClient.post<ApiResponse<InventoryItem>>('/api/inventory', data);
  return response.data.data;
}

/**
 * Updates an existing inventory item
 * @param id - Inventory item ID
 * @param data - Inventory item form data
 * @returns Promise with updated inventory item
 * @throws ApiError if the request fails
 */
export async function updateInventoryItem(id: string, data: InventoryFormData): Promise<InventoryItem> {
  const response = await apiClient.put<ApiResponse<InventoryItem>>(`/api/inventory/${id}`, data);
  return response.data.data;
}

/**
 * Deletes an inventory item
 * @param id - Inventory item ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteInventoryItem(id: string): Promise<void> {
  await apiClient.delete(`/api/inventory/${id}`);
}
