/**
 * Test App - Adding providers one by one
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import AuthStack from './navigation/AuthStack';

export default function App() {
  console.log('[Test2] Rendering with AuthProvider only...');

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AuthStack />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
