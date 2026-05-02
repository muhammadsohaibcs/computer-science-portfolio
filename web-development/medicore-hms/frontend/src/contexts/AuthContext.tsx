/**
 * Authentication Context
 * Provides authentication state and functions throughout the application
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as authApi from '../api/auth.api';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../api/client';
import { AuthContextState, LoginRequest, User } from '../types/auth.types';

/**
 * Authentication Context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth functions to children
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const inactivityTimerRef = useRef<number | null>(null);

  /**
   * Logs out the current user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }

      // Call logout API (best effort - don't fail if it errors)
      await authApi.logout().catch(() => {
        // Ignore logout API errors
      });
    } finally {
      // Always clear local state regardless of API result
      clearTokens();
      setUser(null);
      setRole(null);
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  }, []);

  /**
   * Resets the inactivity timer
   */
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Only set timer if user is authenticated
    if (user) {
      // Set new timer for 10 minutes (600000 ms)
      inactivityTimerRef.current = setTimeout(() => {
        console.warn('Auto-logout due to inactivity');
        logout();
      }, 600000); // 10 minutes
    }
  }, [user, logout]);

  /**
   * Initializes authentication state from stored tokens
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const accessToken = getAccessToken();
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');

        if (accessToken && storedUser && storedRole && storedUser !== 'undefined') {
          // Restore user session from localStorage
          setUser(JSON.parse(storedUser));
          setRole(storedRole);
        } else {
          // Clear invalid data
          clearTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('role');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid data
        clearTokens();
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Set up inactivity tracking
   */
  useEffect(() => {
    if (!user) return;

    // Start inactivity timer
    resetInactivityTimer();

    // Activity events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Reset timer on any activity
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, resetInactivityTimer]);

  /**
   * Logs in a user with credentials
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call login API
      const response = await authApi.login(credentials);
      
      // Store tokens
      setTokens(response.accessToken, response.refreshToken);
      
      // Store user info and role
      setUser(response.user);
      setRole(response.role);
      
      // Persist to localStorage for session restoration
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('role', response.role);
    } catch (error) {
      // Clear any partial state on error
      clearTokens();
      setUser(null);
      setRole(null);
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Re-throw error for component to handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refreshes the access token
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const currentRefreshToken = getRefreshToken();
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Call refresh API
      const response = await authApi.refresh(currentRefreshToken);
      
      // Store new tokens
      setTokens(response.accessToken, response.refreshToken);
    } catch (error) {
      // If refresh fails, log out the user
      await logout();
      throw error;
    }
  }, [logout]);

  const value: AuthContextState = {
    user,
    role,
    isAuthenticated: !!user && !!getAccessToken(),
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
