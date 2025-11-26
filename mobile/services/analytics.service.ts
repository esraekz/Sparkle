/**
 * Analytics API Service
 * Handles home dashboard stats and analytics
 */

import type { HomeStats } from '../types';

export const analyticsService = {
  /**
   * Get home dashboard stats
   * For Phase 1: Returns mock data for active users
   * TODO: Replace with real API call in Phase 2
   */
  async getHomeStats(): Promise<HomeStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data for active users with posts
    // For new users, this will show engagement as null
    const mockStats: HomeStats = {
      postsThisWeek: 2,
      weeklyGoal: 3,
      views: 12400,
      viewsTrend: 18.2,
      engagementRate: 8.2,
      engagementTrend: 2.3,
      consistencyStreak: 4,
    };

    return mockStats;
  },

  /**
   * Get empty stats for new users
   * Used when user has no published posts yet
   */
  async getEmptyStats(weeklyGoal: number): Promise<HomeStats> {
    return {
      postsThisWeek: 0,
      weeklyGoal,
      views: null,
      viewsTrend: null,
      engagementRate: null,
      engagementTrend: null,
      consistencyStreak: 0,
    };
  },
};

export default analyticsService;
