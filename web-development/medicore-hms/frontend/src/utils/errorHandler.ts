/**
 * API Error Handling Utilities
 * Provides functions for formatting and logging API errors
 */

import { AxiosError } from 'axios';
import { ApiError, ValidationError } from '../types/api.types';

/**
 * Formats an Axios error into a standardized ApiError structure
 */
export function formatApiError(error: unknown): ApiError {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: ValidationError[];
      error?: string;
      lockInfo?: {
        resourceId: string;
        lockHolder: string;
        acquiredAt: string;
        expiresAt: string;
      };
    }>;

    const status = axiosError.response?.status || 500;
    const responseData = axiosError.response?.data;

    return {
      message:
        responseData?.message ||
        responseData?.error ||
        axiosError.message ||
        'An unexpected error occurred',
      status,
      errors: responseData?.errors,
      code: axiosError.code,
      lockInfo: responseData?.lockInfo,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }

  // Handle unknown error types
  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}

/**
 * Type guard to check if an error is an AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

/**
 * Gets a user-friendly error message based on status code
 */
export function getErrorMessage(error: ApiError): string {
  // Return specific message if available
  if (error.message && error.message !== 'An unexpected error occurred') {
    return error.message;
  }

  // Return status-based message
  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authorized. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 500:
      return 'A server error occurred. Please try again later.';
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred';
  }
}

/**
 * Logs an error to the console (development) or monitoring service (production)
 */
export function logError(error: ApiError, context?: string): void {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    console.error('[API Error]', {
      context,
      message: error.message,
      status: error.status,
      errors: error.errors,
      code: error.code,
    });
  } else {
    // In production, send to monitoring service
    // TODO: Integrate with monitoring service (e.g., Sentry, LogRocket)
    console.error('[API Error]', error.message);
  }
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: ApiError): boolean {
  return (
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    error.message.toLowerCase().includes('network')
  );
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: ApiError): boolean {
  return error.status === 401;
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: ApiError): boolean {
  return error.status === 422 || !!(error.errors && error.errors.length > 0);
}

/**
 * Extracts validation errors into a field-keyed object
 */
export function getValidationErrors(
  error: ApiError
): Record<string, string> | null {
  if (!error.errors || error.errors.length === 0) {
    return null;
  }

  return error.errors.reduce(
    (acc, err) => {
      acc[err.field] = err.message;
      return acc;
    },
    {} as Record<string, string>
  );
}
