/**
 * Bill Types and Interfaces
 * Defines types for billing and invoice operations
 */

/**
 * Bill item representing a service or product
 */
export interface BillItem {
  service?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Payment record for a bill
 */
export interface Payment {
  method: string;
  amount: number;
  timestamp: string;
}

/**
 * Complete bill entity
 */
export interface Bill {
  _id: string;
  patient: string;
  createdBy?: string;
  items: BillItem[];
  subtotal: number;
  taxes: number;
  total: number;
  paid: boolean;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/updating bills
 */
export interface BillFormData {
  patient: string;
  items: BillItem[];
  subtotal: number;
  taxes: number;
  total: number;
  paid: boolean;
  payments?: Payment[];
}

/**
 * Query parameters for fetching bills
 */
export interface BillQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  patient?: string;
  paid?: boolean;
}
