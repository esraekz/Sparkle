/**
 * Authentication API Service
 * Handles login, signup, and user management
 */

import apiClient, { tokenService } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, LoginCredentials, SignupData, AuthTokens, ApiResponse } from '../types';

const ONBOARDING_COMPLETE_KEY = '@sparkle_onboarding_complete';

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

    // Clear onboarding flag from previous user (if any)
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);

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

    // Clear onboarding flag from previous user (if any)
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);

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
   * Clears token and onboarding flag from storage
   */
  async logout(): Promise<void> {
    await tokenService.removeToken();
    // Clear onboarding flag so next user goes through onboarding
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
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
