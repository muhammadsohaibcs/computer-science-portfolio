/**
 * Dashboard Types
 * Defines types for dashboard statistics and data
 */

/**
 * Dashboard statistics response
 */
export interface DashboardStats {
  patients: number;
  doctors: number;
  appointments: number;
  staff?: number;
  rooms?: {
    total: number;
    available: number;
    occupied: number;
  };
  recentActivity?: RecentActivity[];
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
}
