/**
 * Onboarding API Service
 * Handles brand blueprint creation and management
 */

import apiClient from './api';
import type {
  BrandBlueprint,
  BrandBlueprintCreate,
  BrandBlueprintUpdate,
  ApiResponse,
} from '../types';

export const onboardingService = {
  /**
   * Create brand blueprint
   * POST /onboarding/brand-blueprint
   */
  async createBrandBlueprint(data: BrandBlueprintCreate): Promise<BrandBlueprint> {
    const response = await apiClient.post<ApiResponse<BrandBlueprint>>(
      '/onboarding/brand-blueprint',
      data
    );
    return response.data.data;
  },

  /**
   * Get user's brand blueprint
   * GET /onboarding/brand-blueprint
   */
  async getBrandBlueprint(): Promise<BrandBlueprint> {
    const response = await apiClient.get<ApiResponse<BrandBlueprint>>(
      '/onboarding/brand-blueprint'
    );
    return response.data.data;
  },

  /**
   * Update brand blueprint
   * PUT /onboarding/brand-blueprint
   */
  async updateBrandBlueprint(data: BrandBlueprintUpdate): Promise<BrandBlueprint> {
    const response = await apiClient.put<ApiResponse<BrandBlueprint>>(
      '/onboarding/brand-blueprint',
      data
    );
    return response.data.data;
  },
};

export default onboardingService;
