/**
 * Onboarding Context
 * Manages onboarding form state across all 3 screens
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import onboardingService from '../services/onboarding.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BrandBlueprintCreate, PostingPreferences } from '../types';

const ONBOARDING_COMPLETE_KEY = '@sparkle_onboarding_complete';

interface OnboardingContextType {
  // Form data
  topics: string[];
  mainGoal: string;
  tone: string;
  inspirations: string;
  postingFrequency: number;
  preferredDays: string[];
  preferredTime: string;
  askBeforePublish: boolean;

  // Update methods
  setTopics: (topics: string[]) => void;
  setMainGoal: (goal: string) => void;
  setTone: (tone: string) => void;
  setInspirations: (inspirations: string) => void;
  setPostingFrequency: (frequency: number) => void;
  setPreferredDays: (days: string[]) => void;
  setPreferredTime: (time: string) => void;
  setAskBeforePublish: (value: boolean) => void;

  // Submit
  submitBlueprint: () => Promise<void>;
  isLoading: boolean;

  // Onboarding status
  hasCompletedOnboarding: () => Promise<boolean>;
  markOnboardingComplete: () => Promise<void>;
  onboardingCompletedTrigger: number; // Increments when onboarding completes

  // Reset
  resetOnboardingState: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  // Form state
  const [topics, setTopics] = useState<string[]>([]);
  const [mainGoal, setMainGoal] = useState<string>('');
  const [tone, setTone] = useState<string>('');
  const [inspirations, setInspirations] = useState<string>('');
  const [postingFrequency, setPostingFrequency] = useState<number>(3); // Default: 3x/week
  const [preferredDays, setPreferredDays] = useState<string[]>(['monday', 'wednesday', 'friday']);
  const [preferredTime, setPreferredTime] = useState<string>('14'); // Default: 2 PM (as string for TextInput)
  const [askBeforePublish, setAskBeforePublish] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingCompletedTrigger, setOnboardingCompletedTrigger] = useState(0);

  /**
   * Check if user has completed onboarding
   */
  const hasCompletedOnboarding = async (): Promise<boolean> => {
    try {
      console.log('[OnboardingContext] Checking onboarding status...');

      // First check AsyncStorage flag
      const storageFlag = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      console.log('[OnboardingContext] AsyncStorage flag:', storageFlag);

      if (storageFlag === 'true') {
        console.log('[OnboardingContext] Onboarding complete (from cache)');
        return true;
      }

      // If no flag, check backend for brand blueprint
      console.log('[OnboardingContext] Checking backend for blueprint...');
      const blueprint = await onboardingService.getBrandBlueprint();
      console.log('[OnboardingContext] Blueprint found:', blueprint);

      if (blueprint) {
        // Validate blueprint is actually complete (has required fields)
        const isComplete =
          blueprint.topics && blueprint.topics.length > 0 &&
          blueprint.main_goal && blueprint.main_goal.trim() !== '' &&
          blueprint.tone && blueprint.tone.trim() !== '';

        if (isComplete) {
          // Blueprint exists and is complete, mark as complete
          await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
          console.log('[OnboardingContext] Onboarding complete (from backend)');
          return true;
        } else {
          console.log('[OnboardingContext] Blueprint exists but is incomplete, onboarding not complete');
          return false;
        }
      }

      console.log('[OnboardingContext] No blueprint found, onboarding not complete');
      return false;
    } catch (error) {
      // If 404 or error, onboarding not complete
      console.log('[OnboardingContext] Error checking onboarding:', error);
      return false;
    }
  };

  /**
   * Mark onboarding as complete in AsyncStorage
   */
  const markOnboardingComplete = async (): Promise<void> => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    // Increment trigger to notify App.tsx to re-check onboarding status
    setOnboardingCompletedTrigger(prev => prev + 1);
  };

  /**
   * Submit brand blueprint to backend
   */
  const submitBlueprint = async () => {
    try {
      setIsLoading(true);

      // Map UI state to API format
      const postingPreferences: PostingPreferences = {
        preferred_days: preferredDays,
        preferred_hours: [parseInt(preferredTime)], // Convert string to number
        posts_per_week: postingFrequency,
        ask_before_publish: askBeforePublish,
      };

      // Parse inspirations from comma-separated string to array
      const inspirationsArray = inspirations
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const blueprintData: BrandBlueprintCreate = {
        topics,
        main_goal: mainGoal,
        tone,
        inspirations: inspirationsArray,
        posting_preferences: postingPreferences,
      };

      // Check if blueprint already exists
      try {
        const existing = await onboardingService.getBrandBlueprint();
        if (existing) {
          // Blueprint exists, update it
          await onboardingService.updateBrandBlueprint(blueprintData);
        } else {
          // No blueprint, create new one
          await onboardingService.createBrandBlueprint(blueprintData);
        }
      } catch (error: any) {
        // If 404, blueprint doesn't exist, create it
        if (error.response?.status === 404) {
          await onboardingService.createBrandBlueprint(blueprintData);
        } else {
          // Some other error, rethrow
          throw error;
        }
      }

      await markOnboardingComplete();
    } catch (error) {
      console.error('[OnboardingContext] Submit error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset all onboarding state to initial values
   * Called when user logs out or switches accounts
   */
  const resetOnboardingState = () => {
    console.log('[OnboardingContext] Resetting onboarding state');
    setTopics([]);
    setMainGoal('');
    setTone('');
    setInspirations('');
    setPostingFrequency(3);
    setPreferredDays(['monday', 'wednesday', 'friday']);
    setPreferredTime('14');
    setAskBeforePublish(true);
    setIsLoading(false);
  };

  const value: OnboardingContextType = {
    topics,
    mainGoal,
    tone,
    inspirations,
    postingFrequency,
    preferredDays,
    preferredTime,
    askBeforePublish,
    setTopics,
    setMainGoal,
    setTone,
    setInspirations,
    setPostingFrequency,
    setPreferredDays,
    setPreferredTime,
    setAskBeforePublish,
    submitBlueprint,
    isLoading,
    hasCompletedOnboarding,
    markOnboardingComplete,
    onboardingCompletedTrigger,
    resetOnboardingState,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

/**
 * Hook to access onboarding context
 */
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
