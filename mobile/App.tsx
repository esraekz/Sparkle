/**
 * Sparkle Mobile App
 * AI personal-branding copilot for LinkedIn
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Providers
import QueryProvider from './contexts/QueryProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';

// Navigation
import TabNavigator from './navigation/TabNavigator';
import AuthStack from './navigation/AuthStack';
import OnboardingStack from './navigation/OnboardingStack';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

function AppNavigator() {
  const authContext = useAuth();
  const { hasCompletedOnboarding, onboardingCompletedTrigger, resetOnboardingState } = useOnboarding();
  const [onboardingComplete, setOnboardingComplete] = React.useState<boolean | null>(null);
  const [previousUserId, setPreviousUserId] = React.useState<string | null>(null);

  // Get values directly - they're already booleans from AuthContext
  const isAuthenticated = authContext.isAuthenticated;
  const authLoading = authContext.isLoading;
  const currentUserId = authContext.user?.id || null;

  // Reset onboarding state when user changes (new login)
  React.useEffect(() => {
    if (currentUserId && currentUserId !== previousUserId) {
      console.log('[App] User changed, resetting onboarding state');
      console.log('[App] Previous user:', previousUserId);
      console.log('[App] Current user:', currentUserId);
      resetOnboardingState();
      setPreviousUserId(currentUserId);
      setOnboardingComplete(null); // Force re-check
    } else if (!currentUserId && previousUserId) {
      // User logged out
      console.log('[App] User logged out, resetting state');
      resetOnboardingState();
      setPreviousUserId(null);
      setOnboardingComplete(null);
    }
  }, [currentUserId, previousUserId]);

  // Check onboarding status when user is authenticated OR when onboarding completes
  React.useEffect(() => {
    const checkOnboarding = async () => {
      console.log('[App] isAuthenticated:', isAuthenticated);
      if (isAuthenticated) {
        console.log('[App] User is authenticated, checking onboarding...');
        const completed = await hasCompletedOnboarding();
        console.log('[App] Onboarding completed:', completed);
        setOnboardingComplete(completed);
      } else {
        console.log('[App] User not authenticated, skipping onboarding check');
        setOnboardingComplete(null);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, onboardingCompletedTrigger]);

  // Show loading spinner while checking authentication or onboarding
  if (authLoading || (isAuthenticated && onboardingComplete === null)) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Routing logic:
  // 1. Not authenticated → AuthStack (Login/Signup)
  // 2. Authenticated but no blueprint → OnboardingStack
  // 3. Authenticated with blueprint → TabNavigator (Home)
  if (!isAuthenticated) {
    console.log('[App] Rendering AuthStack (not authenticated)');
    return <AuthStack />;
  }

  if (onboardingComplete === false) {
    console.log('[App] Rendering OnboardingStack (onboarding not complete)');
    return <OnboardingStack />;
  }

  console.log('[App] Rendering TabNavigator (fully authenticated & onboarded)');
  return <TabNavigator />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <OnboardingProvider>
              <NavigationContainer>
                <AppNavigator />
                <StatusBar style="dark" />
              </NavigationContainer>
            </OnboardingProvider>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
