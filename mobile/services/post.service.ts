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
   * GET /posts?status_filter=draft&limit=50
   */
  async getPosts(status?: string, limit: number = 50): Promise<PostListResponse> {
    const params: any = { limit };
    if (status) {
      params.status_filter = status;  // Backend expects 'status_filter' not 'status'
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

  /**
   * Upload image for post
   * POST /posts/upload-image
   */
  async uploadImage(imageUri: string): Promise<string> {
    // Create FormData for image upload
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';

    // Determine file type from extension
    const fileType = filename.toLowerCase().endsWith('.png')
      ? 'image/png'
      : 'image/jpeg';

    // Add image to FormData
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: fileType,
    } as any);

    const response = await apiClient.post<ApiResponse<{ image_url: string }>>(
      '/posts/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data.image_url;
  },

  /**
   * Generate AI image from post content or custom prompt
   * POST /posts/generate-ai-image
   */
  async generateAIImage(postText: string, customPrompt?: string): Promise<string> {
    const requestBody: any = {};

    if (customPrompt) {
      // Custom description mode
      requestBody.source = 'custom_description';
      requestBody.custom_prompt = customPrompt;
      requestBody.post_text = ''; // Not used for custom
    } else {
      // Post content mode
      requestBody.source = 'post_content';
      requestBody.post_text = postText;
    }

    const response = await apiClient.post<ApiResponse<{ image_url: string }>>(
      '/posts/generate-ai-image',
      requestBody
    );

    return response.data.data.image_url;
  },
};

export default postService;
