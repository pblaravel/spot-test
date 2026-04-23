import { useState, useEffect, useCallback } from 'react';
import { apiClient, User } from '@/lib/api-client';

function extractAccessToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const p = payload as Record<string, unknown>;
  if (typeof p.accessToken === 'string') return p.accessToken;
  if (typeof p.token === 'string') return p.token;
  return undefined;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Инициализация при загрузке
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
      // Загружаем профиль пользователя
      loadProfile(token);
    } else {
      setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadProfile = useCallback(async (token: string) => {
    try {
      const response = await apiClient.getProfile();
      if (response.data) {
        setAuthState({
          user: response.data,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Токен недействителен
        logout();
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      logout();
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      if (response.data) {
        const token = extractAccessToken(response.data);
        const user = (response.data as { user: User }).user;
        if (!token) {
          return { success: false, error: 'No access token in response' };
        }
        localStorage.setItem('auth_token', token);
        apiClient.setToken(token);
        
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const response = await apiClient.register(userData);
      if (response.data) {
        const token = extractAccessToken(response.data);
        const user = (response.data as { user: User }).user;
        if (!token) {
          return { success: false, error: 'No access token in response' };
        }
        localStorage.setItem('auth_token', token);
        apiClient.setToken(token);
        
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    apiClient.clearToken();
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(userData);
      if (response.data) {
        const updated = response.data as User;
        setAuthState((prev: AuthState) => ({
          ...prev,
          user: updated,
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
  };
} 