/**
 * Sparkle Mobile App
 * AI personal-branding copilot for LinkedIn
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

// Global error handler
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Exception in HostFunction')) {
      console.log('[DETAILED ERROR] Full error details:');
      console.log('[DETAILED ERROR] Arguments:', JSON.stringify(args, null, 2));
      console.log('[DETAILED ERROR] Stack trace:', new Error().stack);
    }
    originalConsoleError(...args);
  };
}

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
  const { hasCompletedOnboarding } = useOnboarding();
  const [onboardingComplete, setOnboardingComplete] = React.useState<boolean | null>(null);

  // Ensure values are proper booleans
  const isAuthenticated = Boolean(authContext.isAuthenticated);
  const authLoading = Boolean(authContext.isLoading);

  // Check onboarding status when user is authenticated
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
  }, [isAuthenticated]);

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
