/**
 * Authentication API Service
 * Handles login, signup, and user management
 */

import apiClient, { tokenService } from './api';
import type { User, LoginCredentials, SignupData, AuthTokens, ApiResponse } from '../types';

export const authService = {
  /**
   * Login user
   * POST /auth/login (Phase 1: Mock auth)
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', credentials);

    // Store token
    if (response.data.data.access_token) {
      await tokenService.setToken(response.data.data.access_token);
    }

    return response.data.data;
  },

  /**
   * Signup new user
   * POST /auth/signup (Phase 1: Mock auth)
   */
  async signup(data: SignupData): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/signup', data);

    // Store token
    if (response.data.data.access_token) {
      await tokenService.setToken(response.data.data.access_token);
    }

    return response.data.data;
  },

  /**
   * Get current user
   * GET /auth/me
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  /**
   * Logout user
   * Clears token from storage
   */
  async logout(): Promise<void> {
    await tokenService.removeToken();
  },

  /**
   * Check if user is authenticated
   * Returns true if token exists
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenService.getToken();
    return !!token;
  },
};

export default authService;
