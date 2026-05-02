/**
 * Department Types and Interfaces
 * Defines types for department management operations
 */

/**
 * Complete department entity
 */
export interface Department {
  _id: string;
  name: string;
  code?: string;
  head?: string; // Staff ID
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/updating departments
 */
export interface DepartmentFormData {
  name: string;
  code?: string;
  head?: string;
  description?: string;
}

/**
 * Query parameters for fetching departments
 */
export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  q?: string; // Search query
}
