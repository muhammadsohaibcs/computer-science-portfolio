/**
 * Service Types
 * Defines types for hospital service data structures
 */

/**
 * Service entity from the backend
 */
export interface Service {
  _id: string;
  code: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMinutes: number;
  department?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service form data for create/update operations
 */
export interface ServiceFormData {
  code: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMinutes: number;
  department?: string;
  category?: string;
}

/**
 * Service list query parameters
 */
export interface ServiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  category?: string;
}
