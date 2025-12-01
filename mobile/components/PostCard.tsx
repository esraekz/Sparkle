import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';
import StatusBadge from './StatusBadge';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  onDelete?: () => void;
}

export default function PostCard({ post, onPress, onDelete }: PostCardProps) {
  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format scheduled time
  const getScheduledTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
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

    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;

    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr} at ${timeStr}`;
  };

  // Truncate content
  const preview = post.content.length > 100
    ? post.content.substring(0, 100) + '...'
    : post.content;

  const scheduledTime = getScheduledTime(post.scheduled_for);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <StatusBadge status={post.status} size="small" />
        <View style={styles.headerRight}>
          <Text style={styles.time}>{getRelativeTime(post.created_at)}</Text>
          {onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {preview}
      </Text>

      {post.image_url && (
        <Image
          source={{ uri: post.image_url }}
          style={styles.image}
          resizeMode="cover"
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          onLoad={() => console.log('Image loaded successfully:', post.image_url)}
        />
      )}

      {post.hashtags.length > 0 && (
        <View style={styles.hashtagsContainer}>
          {post.hashtags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.hashtag}>
              #{tag}
            </Text>
          ))}
          {post.hashtags.length > 3 && (
            <Text style={styles.hashtagMore}>+{post.hashtags.length - 3}</Text>
          )}
        </View>
      )}

      {scheduledTime && (
        <View style={styles.scheduledContainer}>
          <Text style={styles.scheduledIcon}>📅</Text>
          <Text style={styles.scheduledText}>{scheduledTime}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  time: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
  },
  content: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Layout.spacing.sm,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.sm,
    backgroundColor: Colors.gray100,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.xs,
  },
  hashtag: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginRight: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  hashtagMore: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  scheduledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.xs,
    paddingTop: Layout.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  scheduledIcon: {
    fontSize: 14,
    marginRight: Layout.spacing.xs,
  },
  scheduledText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.info,
    fontWeight: Typography.fontWeight.medium,
  },
});
