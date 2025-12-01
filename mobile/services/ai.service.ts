/**
 * AI Generation API Service
 * Handles AI-powered content generation and improvement
 */

import apiClient from './api';
import type {
  AIAction,
  AIAssistRequest,
  AIAssistResponse,
  ApiResponse,
} from '../types';

export const aiService = {
  /**
   * Get AI assistance for content generation
   * POST /posts/ai-assist
   *
   * Supported actions:
   * - continue: Continue writing from current text
   * - rephrase: Rewrite text with different words
   * - grammar: Fix spelling and grammar errors
   * - engagement: Make content more compelling
   * - shorter: Condense text while keeping core message
   *
   * All responses include:
   * - content: Generated/improved text
   * - hashtags: 3-5 relevant hashtags
   * - hook_suggestion: Alternative opening line
   */
  async generateContent(action: AIAction, text: string): Promise<AIAssistResponse> {
    const data: AIAssistRequest = { action, text };
    const response = await apiClient.post<ApiResponse<AIAssistResponse>>(
      '/posts/ai-assist',
      data
    );
    return response.data.data;
  },

  /**
   * Continue writing from current text
   */
  async continueWriting(text: string): Promise<AIAssistResponse> {
    return this.generateContent('continue', text);
  },

  /**
   * Rephrase text with different words
   */
  async rephrase(text: string): Promise<AIAssistResponse> {
    return this.generateContent('rephrase', text);
  },

  /**
   * Fix spelling and grammar errors
   */
  async correctGrammar(text: string): Promise<AIAssistResponse> {
    return this.generateContent('grammar', text);
  },

  /**
   * Make content more compelling and engaging
   */
  async improveEngagement(text: string): Promise<AIAssistResponse> {
    return this.generateContent('engagement', text);
  },

  /**
   * Condense text while keeping core message
   */
  async makeShort(text: string): Promise<AIAssistResponse> {
    return this.generateContent('shorter', text);
  },
};

export default aiService;
