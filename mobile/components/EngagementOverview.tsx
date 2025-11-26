import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';

interface EngagementOverviewProps {
  views: number | null;
  viewsTrend: number | null;
  engagementRate: number | null;
  engagementTrend: number | null;
}

export default function EngagementOverview({
  views,
  viewsTrend,
  engagementRate,
  engagementTrend,
}: EngagementOverviewProps) {
  const formatNumber = (num: number | null) => {
    if (num === null) return '—';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercent = (num: number | null) => {
    if (num === null) return '—';
    return num.toFixed(1) + '%';
  };

  const TrendArrow = ({ trend }: { trend: number | null }) => {
    if (trend === null) return null;
    return (
      <Text style={[styles.trend, trend >= 0 ? styles.trendUp : styles.trendDown]}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Engagement Overview</Text>

      <View style={styles.metricsRow}>
        {/* Views */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Views</Text>
          <Text style={styles.metricValue}>{formatNumber(views)}</Text>
          <TrendArrow trend={viewsTrend} />
        </View>

        {/* Engagement Rate */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Engagement</Text>
          <Text style={styles.metricValue}>{formatPercent(engagementRate)}</Text>
          <TrendArrow trend={engagementTrend} />
        </View>
      </View>

      {views === null && engagementRate === null && (
        <Text style={styles.emptyMessage}>Post to see your stats</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  trend: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  trendUp: {
    color: Colors.success,
  },
  trendDown: {
    color: Colors.error,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
    fontStyle: 'italic',
  },
});
