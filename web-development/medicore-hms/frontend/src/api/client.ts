/**
 * Axios API Client
 * Configures Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import config from '../config';
import { formatApiError, isAuthError, logError } from '../utils/errorHandler';

/**
 * Token storage interface
 */
interface TokenStorage {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * In-memory token storage
 */
const tokenStorage: TokenStorage = {
  accessToken: null,
  refreshToken: null,
};

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;

/**
 * Queue of failed requests waiting for token refresh
 */
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Creates and configures the Axios client instance
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: Add Authorization header
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle errors and token refresh
  client.interceptors.response.use(
    (response) => {
      // Return successful responses as-is
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Format and log the error
      const apiError = formatApiError(error);
      logError(apiError, 'API Response Error');

      // Handle 401 Unauthorized errors with token refresh
      if (isAuthError(apiError) && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              resolve: (token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(client(originalRequest));
              },
              reject: (err: unknown) => {
                reject(err);
              },
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            // Update the failed request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            // Process queued requests
            processQueue(null, newAccessToken);

            // Retry the original request
            return client(originalRequest);
          } else {
            // Refresh failed, clear tokens and redirect to login
            processQueue(new Error('Token refresh failed'), null);
            handleAuthFailure();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
          processQueue(error, null);
          handleAuthFailure();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // For all other errors, reject with formatted error
      return Promise.reject(apiError);
    }
  );

  return client;
}

/**
 * Processes the queue of failed requests after token refresh
 */
function processQueue(
  error: Error | null,
  token: string | null
): void {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedRequestsQueue = [];
}

/**
 * Attempts to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    // Create a new axios instance without interceptors to avoid infinite loops
    const response = await axios.post(
      `${config.apiBaseUrl}/api/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Store the new tokens
    setTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch (error) {
    // Refresh failed
    logError(formatApiError(error), 'Token Refresh Failed');
    return null;
  }
}

/**
 * Handles authentication failure by clearing tokens and redirecting to login
 */
function handleAuthFailure(): void {
  clearTokens();
  
  // Redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/**
 * Gets the access token from storage
 */
export function getAccessToken(): string | null {
  // Try memory first
  if (tokenStorage.accessToken) {
    return tokenStorage.accessToken;
  }

  // Fallback to localStorage
  return localStorage.getItem('accessToken');
}

/**
 * Gets the refresh token from storage
 */
export function getRefreshToken(): string | null {
  // Try memory first
  if (tokenStorage.refreshToken) {
    return tokenStorage.refreshToken;
  }

  // Fallback to localStorage
  return localStorage.getItem('refreshToken');
}

/**
 * Stores tokens in memory and localStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  // Store in memory
  tokenStorage.accessToken = accessToken;
  tokenStorage.refreshToken = refreshToken;

  // Store in localStorage as fallback
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Clears all stored tokens
 */
export function clearTokens(): void {
  // Clear memory
  tokenStorage.accessToken = null;
  tokenStorage.refreshToken = null;

  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

// Create and export the configured API client
const apiClient = createApiClient();

export default apiClient;
