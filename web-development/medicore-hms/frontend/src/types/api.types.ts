/**
 * API Types and Interfaces
 * Defines types for API requests, responses, and errors
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Lock information for pessimistic locking
 */
export interface LockInfo {
  resourceId: string;
  lockHolder: string;
  acquiredAt: string;
  expiresAt: string;
}

/**
 * API error structure
 */
export interface ApiError {
  message: string;
  status: number;
  errors?: ValidationError[];
  code?: string;
  lockInfo?: LockInfo;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * API request configuration
 */
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}
