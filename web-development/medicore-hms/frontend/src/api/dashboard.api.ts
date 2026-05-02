/**
 * Dashboard API Module
 * Handles API calls for dashboard statistics
 */

import { ApiResponse } from '../types/api.types';
import { DashboardStats } from '../types/dashboard.types';
import apiClient from './client';

/**
 * Fetches dashboard statistics from the backend
 * @returns Promise with dashboard statistics
 * @throws ApiError if the request fails
 */
export async function getStats(): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/api/stats');
  return response.data.data;
}
