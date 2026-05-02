// Insurance API module
import type { Insurance, InsuranceFormData, InsuranceListResponse } from '../types/insurance.types';
import apiClient from './client';

/**
 * Fetch all insurance records with pagination and search
 */
export const getInsurances = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<InsuranceListResponse> => {
  const response = await apiClient.get('/api/insurance', { params });
  return response.data;
};

/**
 * Fetch a single insurance record by ID
 */
export const getInsuranceById = async (id: string): Promise<Insurance> => {
  const response = await apiClient.get(`/api/insurance/${id}`);
  return response.data;
};

/**
 * Create a new insurance record
 */
export const createInsurance = async (data: InsuranceFormData): Promise<Insurance> => {
  const response = await apiClient.post('/api/insurance', data);
  return response.data;
};

/**
 * Update an existing insurance record
 */
export const updateInsurance = async (id: string, data: InsuranceFormData): Promise<Insurance> => {
  const response = await apiClient.put(`/api/insurance/${id}`, data);
  return response.data;
};

/**
 * Delete an insurance record
 */
export const deleteInsurance = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/insurance/${id}`);
};
