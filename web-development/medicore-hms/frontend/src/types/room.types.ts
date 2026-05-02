/**
 * Room Types and Interfaces
 * Defines types for room management operations
 */

/**
 * Room type enumeration
 */
export type RoomType = 'General' | 'Private' | 'ICU' | 'Operation' | 'Emergency' | 'Semi-Private' | 'Ward';

/**
 * Room status enumeration
 */
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';

/**
 * Complete room entity
 */
export interface Room {
  _id: string;
  roomNumber: string;
  type: RoomType;
  status: RoomStatus;
  floor?: number;
  capacity?: number;
  currentOccupancy?: number;
  assignedPatient?: string; // Patient ID
  assignedPatientName?: string; // Populated patient name
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/updating rooms
 */
export interface RoomFormData {
  roomNumber: string;
  type: RoomType;
  status: RoomStatus;
  floor?: number;
  capacity?: number;
  assignedPatient?: string;
  features?: string[];
}

/**
 * Query parameters for fetching rooms
 */
export interface RoomQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: RoomType;
  status?: RoomStatus;
  floor?: number;
}
