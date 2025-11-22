/**
 * TypeScript type definitions for Sparkle mobile app
 * Matches backend Pydantic models
 */

// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
}

// ============================================
// Brand Blueprint Types
// ============================================

export interface BrandBlueprint {
  id: string;
  user_id: string;
  topics: string[];
  main_goal: 'become_top_voice' | 'increase_visibility' | 'attract_headhunters' | 'build_network';
  tone: 'warm_relatable' | 'assertive_expert' | 'innovative_creative' | 'inspiring_motivational';
  inspirations: string[];
  posting_preferences: PostingPreferences;
  created_at: string;
  updated_at: string | null;
}

export interface PostingPreferences {
  preferred_days: string[]; // e.g., ['monday', 'wednesday', 'friday']
  preferred_hours: number[]; // e.g., [9, 12, 17]
  posts_per_week: number;
  ask_before_publish: boolean;
}

export interface BrandBlueprintCreate {
  topics: string[];
  main_goal: string;
  tone: string;
  inspirations: string[];
  posting_preferences: PostingPreferences;
}

export interface BrandBlueprintUpdate {
  topics?: string[];
  main_goal?: string;
  tone?: string;
  inspirations?: string[];
  posting_preferences?: PostingPreferences;
}

// ============================================
// Post Types
// ============================================

export type PostStatus = 'draft' | 'scheduled' | 'published';
export type SourceType = 'ai_generated' | 'manual' | 'trending_news';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  hashtags: string[];
  status: PostStatus;
  source_type: SourceType;
  source_article_id: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  engagement_metrics: EngagementMetrics | null;
  created_at: string;
  updated_at: string | null;
}

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
}

export interface PostCreate {
  content: string;
  hashtags?: string[];
  source_type?: SourceType;
  source_article_id?: string;
}

export interface PostUpdate {
  content?: string;
  hashtags?: string[];
}

export interface PostSchedule {
  scheduled_for: string; // ISO 8601 datetime
}

export interface PostListResponse {
  posts: Post[];
  count: number;
  filter: string | null;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message: string;
}

export interface ApiError {
  detail: string;
}

// ============================================
// Navigation Types
// ============================================

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Post: undefined;
  Social: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type PostStackParamList = {
  CreatePost: undefined;
  EditPost: { postId: string };
  Schedule: { postId: string };
};
