import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';
import type { PostStatus } from '../types';

interface StatusBadgeProps {
  status: PostStatus;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          backgroundColor: Colors.gray200,
          textColor: Colors.gray700,
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          backgroundColor: '#E3F2FD', // Light blue
          textColor: Colors.info,
        };
      case 'published':
        return {
          label: 'Published',
          backgroundColor: '#E8F5E9', // Light green
          textColor: Colors.success,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        size === 'small' && styles.badgeSmall,
        { backgroundColor: config.backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'small' && styles.textSmall,
          { color: config.textColor },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
  },
  text: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  textSmall: {
    fontSize: Typography.fontSize.xs,
  },
});
