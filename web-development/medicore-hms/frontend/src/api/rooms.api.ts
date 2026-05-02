/**
 * Rooms API Module
 * Handles all room-related API calls
 */

import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { Room, RoomFormData, RoomQueryParams } from '../types/room.types';
import apiClient from './client';

/**
 * Fetches a paginated list of rooms with optional filters
 * @param params - Query parameters (page, limit, search, type, status, floor)
 * @returns Promise with paginated room list
 * @throws ApiError if the request fails
 */
export async function getRooms(params?: RoomQueryParams): Promise<PaginatedResponse<Room>> {
  const response = await apiClient.get<PaginatedResponse<Room>>('/api/rooms', {
    params,
  });
  return response.data;
}

/**
 * Fetches a single room by ID
 * @param id - Room ID
 * @returns Promise with room data
 * @throws ApiError if the request fails
 */
export async function getRoomById(id: string): Promise<Room> {
  const response = await apiClient.get<ApiResponse<Room>>(`/api/rooms/${id}`);
  return response.data.data;
}

/**
 * Creates a new room
 * @param data - Room form data
 * @returns Promise with created room
 * @throws ApiError if the request fails
 */
export async function createRoom(data: RoomFormData): Promise<Room> {
  // Map roomNumber to number for backend compatibility
  const payload = {
    number: data.roomNumber,
    type: data.type,
    status: data.status,
    department: data.assignedPatient, // This might need adjustment based on actual usage
  };
  const response = await apiClient.post<ApiResponse<Room>>('/api/rooms', payload);
  return response.data.data;
}

/**
 * Updates an existing room
 * @param id - Room ID
 * @param data - Room form data
 * @returns Promise with updated room
 * @throws ApiError if the request fails
 */
export async function updateRoom(id: string, data: RoomFormData): Promise<Room> {
  // Map roomNumber to number for backend compatibility
  const payload = {
    number: data.roomNumber,
    type: data.type,
    status: data.status,
  };
  const response = await apiClient.put<ApiResponse<Room>>(`/api/rooms/${id}`, payload);
  return response.data.data;
}

/**
 * Deletes a room
 * @param id - Room ID
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if the request fails
 */
export async function deleteRoom(id: string): Promise<void> {
  await apiClient.delete(`/api/rooms/${id}`);
}
