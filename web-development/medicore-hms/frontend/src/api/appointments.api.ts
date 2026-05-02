/**
 * Appointments API Module
 * Handles all appointment-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import {
    Appointment,
    AppointmentFormData,
    AppointmentQueryParams,
} from '../types/appointment.types';
import apiClient from './client';

/**
 * Fetches a paginated list of appointments with optional filters
 * @param params - Query parameters (page, limit, search, filters)
 * @returns Promise with paginated appointment list
 * @throws ApiError if the request fails
 */
export async function getAppointments(
  params?: AppointmentQueryParams
): Promise<PaginatedResponse<Appointment>> {
  const response = await apiClient.get<PaginatedResponse<Appointment>>('/api/appointments', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single appointment by ID
 * @param id - Appointment ID
 * @returns Promise with appointment data
 * @throws ApiError if the request fails
 */
export async function getAppointmentById(id: string): Promise<Appointment> {
  const response = await apiClient.get<ApiResponse<Appointment>>(`/api/appointments/${id}`);
  return response.data.data;
}

/**
 * Creates a new appointment
 * @param data - Appointment form data
 * @returns Promise with created appointment
 * @throws ApiError if the request fails (including 409 for conflicts)
 */
export async function createAppointment(data: AppointmentFormData): Promise<Appointment> {
  try {
    const response = await apiClient.post<ApiResponse<Appointment>>('/api/appointments', data);
    return response.data.data;
  } catch (error: any) {
    // Handle 409 conflict errors specifically
    if (error.response?.status === 409) {
      throw {
        message: error.response.data.message || 'Appointment conflict detected',
        status: 409,
        conflictingAppointment: error.response.data.conflictingAppointment,
      };
    }
    throw error;
  }
}

/**
 * Updates an existing appointment
 * @param id - Appointment ID
 * @param data - Appointment form data
 * @returns Promise with updated appointment
 * @throws ApiError if the request fails (including 409 for conflicts)
 */
export async function updateAppointment(
  id: string,
  data: AppointmentFormData
): Promise<Appointment> {
  try {
    const response = await apiClient.put<ApiResponse<Appointment>>(
      `/api/appointments/${id}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    // Handle 409 conflict errors specifically
    if (error.response?.status === 409) {
      throw {
        message: error.response.data.message || 'Appointment conflict detected',
        status: 409,
        conflictingAppointment: error.response.data.conflictingAppointment,
      };
    }
    throw error;
  }
}

/**
 * Deletes an appointment
 * @param id - Appointment ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteAppointment(id: string): Promise<void> {
  await apiClient.delete(`/api/appointments/${id}`);
}

/**
 * Checks doctor availability for a specific date and time
 * @param doctorId - Doctor ID
 * @param date - Date to check (ISO string)
 * @param duration - Duration in minutes
 * @returns Promise with availability status
 * @throws ApiError if the request fails
 */
export async function checkDoctorAvailability(
  doctorId: string,
  date: string,
  duration: number
): Promise<{ available: boolean; message?: string }> {
  const response = await apiClient.get<ApiResponse<{ available: boolean; message?: string }>>(
    '/api/appointments/check-availability',
    {
      params: {
        doctor: doctorId,
        date,
        duration,
      },
    }
  );
  return response.data.data;
}
