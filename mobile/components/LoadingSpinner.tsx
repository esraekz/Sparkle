import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({
  message,
  size = 'large',
}: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  message: {
    marginTop: Layout.spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
