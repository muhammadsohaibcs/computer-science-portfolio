/**
 * Inventory Types and Interfaces
 * Defines types for inventory management operations
 */

/**
 * Complete inventory item entity
 */
export interface InventoryItem {
  _id: string;
  itemCode: string;
  name: string;
  category?: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/updating inventory items
 */
export interface InventoryFormData {
  itemCode: string;
  name: string;
  category?: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
  supplier?: string;
}

/**
 * Query parameters for fetching inventory items
 */
export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}
