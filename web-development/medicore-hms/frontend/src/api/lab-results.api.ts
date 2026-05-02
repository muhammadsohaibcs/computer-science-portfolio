import { PaginatedResponse } from '../types/api.types';
import { LabResult, LabResultFormData, LabResultQueryParams, UploadProgressCallback } from '../types/lab-result.types';
import apiClient from './client';

export async function getLabResultsByPatient(patientId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<LabResult>> {
  const response = await apiClient.get<PaginatedResponse<LabResult>>(`/api/lab-results/patient/${patientId}`, { params });
  return response.data;
}

export async function getLabResults(params?: LabResultQueryParams): Promise<PaginatedResponse<LabResult>> {
  if (params?.patient) return getLabResultsByPatient(params.patient, { page: params.page, limit: params.limit });
  const response = await apiClient.get<PaginatedResponse<LabResult>>('/api/lab-results', { params: { page: params?.page, limit: params?.limit } });
  return response.data;
}

export async function getLabResultById(id: string): Promise<LabResult> {
  const response = await apiClient.get<LabResult>(`/api/lab-results/${id}`);
  return response.data;
}

export async function createLabResult(data: LabResultFormData, onUploadProgress?: UploadProgressCallback): Promise<LabResult> {
  const payload = { patient: data.patient, testName: data.testName, result: data.result, normalRange: data.normalRange, units: data.units, performedBy: data.performedBy, performedAt: data.performedAt };
  const response = await apiClient.post<LabResult>('/api/lab-results', payload);
  const labResult = response.data;
  if (data.attachments && data.attachments.length > 0) {
    for (const file of data.attachments) await uploadLabResultAttachment(labResult._id, file, onUploadProgress);
    return getLabResultById(labResult._id);
  }
  return labResult;
}

export async function uploadLabResultAttachment(labResultId: string, file: File, onUploadProgress?: UploadProgressCallback): Promise<LabResult> {
  const formData = new FormData();
  formData.append('report', file);
  const uploadResponse = await apiClient.post<{ filename: string; url: string }>('/api/lab-results/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => { if (onUploadProgress && evt.total) onUploadProgress(Math.round((evt.loaded * 100) / evt.total)); },
  });
  const response = await apiClient.post<LabResult>(`/api/lab-results/${labResultId}/attachment`, { filename: uploadResponse.data.filename || file.name, url: uploadResponse.data.url });
  return response.data;
}

export async function deleteLabResult(id: string): Promise<void> { await apiClient.delete(`/api/lab-results/${id}`); }

export async function downloadLabResultFile(url: string, filename: string): Promise<void> {
  const fullUrl = url.startsWith('/') ? `${apiClient.defaults.baseURL}${url}` : url;
  const response = await apiClient.get(fullUrl, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = Object.assign(document.createElement('a'), { href: blobUrl, download: filename });
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

export function getFilePreviewUrl(url: string): string {
  return url.startsWith('/') ? `${apiClient.defaults.baseURL}${url}` : url;
}
