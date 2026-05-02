export interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
  twoFactorEnabled?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
  totpCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  user: User;
  requires2FA?: boolean; // true when server needs TOTP before issuing tokens
}

export interface RefreshRequest { refreshToken: string; }
export interface RefreshResponse { accessToken: string; refreshToken: string; }

export interface AuthContextState {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  otp: string;
}
