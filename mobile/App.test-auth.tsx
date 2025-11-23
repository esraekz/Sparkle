import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Stack = createNativeStackNavigator();

function TestScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Testing AuthProvider</Text>
      <Text style={styles.subtext}>Authenticated: {String(isAuthenticated)}</Text>
      <Text style={styles.subtext}>Loading: {String(isLoading)}</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Test" component={TestScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    color: '#000000',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
});
