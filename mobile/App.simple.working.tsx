/**
 * Simplified App - Debugging version
 * Use this to test if the error is in contexts or navigation
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthStack from './navigation/AuthStack';

export default function App() {
  console.log('[SimpleApp] Rendering...');

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
