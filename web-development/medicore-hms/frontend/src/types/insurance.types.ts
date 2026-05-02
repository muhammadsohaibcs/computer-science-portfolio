// Insurance types for the Hospital Management System

export interface Insurance {
  _id: string;
  providerName: string;
  policyNumber: string;
  patient: string;
  validFrom?: string;
  validTo?: string;
  details?: any;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceFormData {
  providerName: string;
  policyNumber: string;
  patient: string;
  validFrom?: string;
  validTo?: string;
  details?: any;
}

export interface InsuranceListResponse {
  data: Insurance[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
