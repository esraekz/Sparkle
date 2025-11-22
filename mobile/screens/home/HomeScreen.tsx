import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>
          Dashboard and analytics will appear here
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
