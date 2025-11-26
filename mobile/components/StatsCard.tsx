import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';

interface StatsCardProps {
  label: string;
  current: number;
  goal: number;
  showCheckmark?: boolean;
}

export default function StatsCard({
  label,
  current,
  goal,
  showCheckmark = false,
}: StatsCardProps) {
  const progress = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {isComplete && showCheckmark && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stats}>
          {current}/{goal}
        </Text>
      </View>

      <Text style={styles.subtitle}>posts published</Text>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  checkmark: {
    fontSize: 28,
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stats: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    lineHeight: 56,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: Layout.spacing.md,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.text,
    borderRadius: 3,
  },
});
