/**
 * Posts API Service
 * Handles all post-related operations
 */

import apiClient from './api';
import type {
  Post,
  PostCreate,
  PostUpdate,
  PostSchedule,
  PostListResponse,
  ApiResponse,
} from '../types';

export const postService = {
  /**
   * Create a new post
   * POST /posts
   */
  async createPost(data: PostCreate): Promise<Post> {
    const response = await apiClient.post<ApiResponse<Post>>('/posts', data);
    return response.data.data;
  },

  /**
   * Get all posts for current user
   * GET /posts?status=draft&limit=50
   */
  async getPosts(status?: string, limit: number = 50): Promise<PostListResponse> {
    const params: any = { limit };
    if (status) {
      params.status = status;
    }

    const response = await apiClient.get<ApiResponse<PostListResponse>>('/posts', { params });
    return response.data.data;
  },

  /**
   * Get specific post by ID
   * GET /posts/{post_id}
   */
  async getPost(postId: string): Promise<Post> {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/${postId}`);
    return response.data.data;
  },

  /**
   * Update post content/hashtags
   * PUT /posts/{post_id}
   */
  async updatePost(postId: string, data: PostUpdate): Promise<Post> {
    const response = await apiClient.put<ApiResponse<Post>>(`/posts/${postId}`, data);
    return response.data.data;
  },

  /**
   * Delete/discard post
   * DELETE /posts/{post_id}
   */
  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}`);
  },

  /**
   * Schedule post for future publication
   * POST /posts/{post_id}/schedule
   */
  async schedulePost(postId: string, scheduledFor: string): Promise<Post> {
    const data: PostSchedule = { scheduled_for: scheduledFor };
    const response = await apiClient.post<ApiResponse<Post>>(
      `/posts/${postId}/schedule`,
      data
    );
    return response.data.data;
  },

  /**
   * Publish post now
   * POST /posts/{post_id}/publish
   */
  async publishPost(postId: string): Promise<Post> {
    const response = await apiClient.post<ApiResponse<Post>>(`/posts/${postId}/publish`);
    return response.data.data;
  },
};

export default postService;
