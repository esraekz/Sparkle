/**
 * Minimal test app to isolate the boolean error
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TestApp() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.text}>✨ Test App Loading...</Text>
        <Text style={styles.subtext}>If you see this, components are OK</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#666666',
  },
});
