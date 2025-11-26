import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';
import type { Post } from '../types';

interface ScheduledPostCardProps {
  post: Post;
  onPress?: () => void;
}

export default function ScheduledPostCard({ post, onPress }: ScheduledPostCardProps) {
  // Format scheduled time
  const formatScheduledTime = (scheduledFor: string | null) => {
    if (!scheduledFor) return '';

    const date = new Date(scheduledFor);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) {
      return `Today, ${timeStr}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr}, ${timeStr}`;
    }
  };

  // Get first 50 characters of content
  const preview = post.content.length > 50
    ? post.content.substring(0, 50) + '...'
    : post.content;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>16</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {preview}
        </Text>
        <Text style={styles.time}>
          {formatScheduledTime(post.scheduled_for)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginRight: Layout.spacing.sm,
    width: 280,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  badgeText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  time: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
