/**
 * Supplier Types and Interfaces
 * Defines types for supplier management operations
 */

/**
 * Supplier contact information
 */
export interface SupplierContact {
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * Complete supplier entity
 */
export interface Supplier {
  _id: string;
  name: string;
  contact: SupplierContact;
  suppliedItems?: string[]; // Array of inventory item IDs
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/updating suppliers
 */
export interface SupplierFormData {
  name: string;
  contact: SupplierContact;
}

/**
 * Query parameters for fetching suppliers
 */
export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  q?: string; // Search query
}
