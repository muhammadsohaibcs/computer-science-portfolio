import { ApiResponse } from '../types/api.types';
import { AuthResponse, ChangePasswordRequest, LoginRequest, RefreshRequest, RefreshResponse } from '../types/auth.types';
import apiClient from './client';

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
  return response.data.data;
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const payload: RefreshRequest = { refreshToken };
  const response = await apiClient.post<ApiResponse<RefreshResponse>>('/api/auth/refresh', payload);
  return response.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}

/** Step 1: Request OTP sent to user's registered email */
export async function requestPasswordChangeOtp(): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/api/auth/request-otp');
  return response.data.data;
}

/** Step 2: Verify OTP + change password atomically */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  otp: string;
}): Promise<void> {
  await apiClient.post('/api/auth/change-password', data);
}

/** Toggle 2FA on/off — backend generates TOTP secret on enable */
export async function toggle2FA(enable: boolean): Promise<{ secret?: string; qrDataUrl?: string; message: string }> {
  const response = await apiClient.post<ApiResponse<{ secret?: string; qrDataUrl?: string; message: string }>>(
    '/api/auth/2fa/toggle',
    { enable }
  );
  return response.data.data;
}

/** Verify a TOTP code (used during 2FA login step) */
export async function verify2FA(code: string): Promise<{ accessToken: string; refreshToken: string; role: string; user: AuthResponse['user'] }> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/2fa/verify', { code });
  return response.data.data;
}

/** Get current user's 2FA status */
export async function get2FAStatus(): Promise<{ twoFactorEnabled: boolean; email?: string }> {
  const response = await apiClient.get<ApiResponse<{ twoFactorEnabled: boolean; email?: string }>>('/api/auth/2fa/status');
  return response.data.data;
}
