/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth.service';
import { tokenService } from '../services/api';
import type { User, LoginCredentials, SignupData } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(true));

  // Check authentication status on app launch
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated
   * Runs on app launch to restore session
   */
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await tokenService.getToken();

      if (token) {
        // Token exists, fetch user data
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } else {
        // No token, user not authenticated
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Check auth error:', error);
      // If error fetching user, clear token and set user to null
      await tokenService.removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // Call login API (returns token and user)
      const authResponse = await authService.login(credentials);

      // Token is automatically stored by authService.login()
      // Fetch fresh user data
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error; // Re-throw so LoginScreen can show error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Signup new user
   */
  const signup = async (data: SignupData) => {
    try {
      setIsLoading(true);

      // Call signup API (returns token and user)
      const authResponse = await authService.signup(data);

      // Token is automatically stored by authService.signup()
      // Fetch fresh user data
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('[AuthContext] Signup error:', error);
      throw error; // Re-throw so SignupScreen can show error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: Boolean(isLoading),
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
