import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ScheduleModal from '../../components/ScheduleModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { postService } from '../../services/post.service';
import type { PostStackParamList } from '../../types';

type EditPostScreenRouteProp = RouteProp<PostStackParamList, 'EditPost'>;
type EditPostScreenNavigationProp = NativeStackNavigationProp<PostStackParamList, 'EditPost'>;

const MAX_CHARS = 3000;

export default function EditPostScreen() {
  const navigation = useNavigation<EditPostScreenNavigationProp>();
  const route = useRoute<EditPostScreenRouteProp>();
  const queryClient = useQueryClient();

  const { postId } = route.params;

  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Fetch post data
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postService.getPost(postId),
  });

  // Load post data into form when it's fetched
  React.useEffect(() => {
    if (post) {
      setContent(post.content);
      setHashtags(post.hashtags.join(', '));
    }
  }, [post]);

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: (data: { content: string; hashtags: string[] }) =>
      postService.updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: () => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Schedule post mutation
  const schedulePostMutation = useMutation({
    mutationFn: (scheduledFor: string) =>
      postService.schedulePost(postId, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  // Publish post mutation
  const publishPostMutation = useMutation({
    mutationFn: () => postService.publishPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  const parseHashtags = (hashtagString: string): string[] => {
    return hashtagString
      .split(',')
      .map(tag => tag.trim().replace(/^#/, ''))
      .filter(tag => tag.length > 0);
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    setIsSaving(true);
    try {
      await updatePostMutation.mutateAsync({
        content: content.trim(),
        hashtags: parseHashtags(hashtags),
      });

      Alert.alert('Success', 'Draft updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async (scheduledDate: Date) => {
    setShowScheduleModal(false);
    setIsSaving(true);

    try {
      // First save any content changes
      if (content !== post?.content || hashtags !== post?.hashtags.join(', ')) {
        await updatePostMutation.mutateAsync({
          content: content.trim(),
          hashtags: parseHashtags(hashtags),
        });
      }

      // Then schedule
      await schedulePostMutation.mutateAsync(scheduledDate.toISOString());

      Alert.alert('Success', 'Post scheduled successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to schedule post');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostNow = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    setIsSaving(true);
    try {
      // First save any content changes
      if (content !== post?.content || hashtags !== post?.hashtags.join(', ')) {
        await updatePostMutation.mutateAsync({
          content: content.trim(),
          hashtags: parseHashtags(hashtags),
        });
      }

      // Then publish
      await publishPostMutation.mutateAsync();

      // Copy to clipboard
      await Clipboard.setStringAsync(content.trim());

      Alert.alert(
        'Success! 🎉',
        'Post published and copied to clipboard. Paste it on LinkedIn now!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to publish post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Post?',
      'This action cannot be undone. Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostMutation.mutateAsync();
              Alert.alert('Success', 'Post deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading post..." />
      </SafeAreaView>
    );
  }

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const charCountColor = isOverLimit ? Colors.error : Colors.textSecondary;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <StatusBadge status={post.status} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Content Input */}
          <View style={styles.section}>
            <TextInput
              style={styles.contentInput}
              placeholder="Write your post here..."
              placeholderTextColor={Colors.gray500}
              multiline
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            <View style={styles.charCountContainer}>
              <Text style={[styles.charCount, { color: charCountColor }]}>
                {charCount}/{MAX_CHARS}
              </Text>
            </View>
          </View>

          {/* Hashtags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hashtags</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Leadership, Innovation, AI (comma-separated)"
              placeholderTextColor={Colors.gray500}
              value={hashtags}
              onChangeText={setHashtags}
            />
          </View>

          {/* Post Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(post.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {post.scheduled_for && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Scheduled for</Text>
              <Text style={styles.infoValue}>
                {new Date(post.scheduled_for).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}

          {post.published_at && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Published at</Text>
              <Text style={styles.infoValue}>
                {new Date(post.published_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.discardButton}
            onPress={handleDiscard}
            disabled={isSaving}
          >
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            {post.status === 'draft' && (
              <>
                <Button
                  title="Save"
                  variant="outline"
                  onPress={handleSaveDraft}
                  loading={isSaving}
                  disabled={isSaving || !content.trim() || isOverLimit}
                  style={styles.smallButton}
                />
                <Button
                  title="Schedule"
                  variant="secondary"
                  onPress={() => setShowScheduleModal(true)}
                  disabled={isSaving || !content.trim() || isOverLimit}
                  style={styles.smallButton}
                />
                <Button
                  title="Post Now"
                  variant="primary"
                  onPress={handlePostNow}
                  loading={isSaving}
                  disabled={isSaving || !content.trim() || isOverLimit}
                  style={styles.smallButton}
                />
              </>
            )}

            {post.status === 'scheduled' && (
              <>
                <Button
                  title="Save"
                  variant="outline"
                  onPress={handleSaveDraft}
                  loading={isSaving}
                  disabled={isSaving || !content.trim() || isOverLimit}
                  style={styles.mediumButton}
                />
                <Button
                  title="Post Now"
                  variant="primary"
                  onPress={handlePostNow}
                  loading={isSaving}
                  disabled={isSaving || !content.trim() || isOverLimit}
                  style={styles.mediumButton}
                />
              </>
            )}

            {post.status === 'published' && (
              <Button
                title="Copy Again"
                variant="primary"
                onPress={async () => {
                  await Clipboard.setStringAsync(content.trim());
                  Alert.alert('Copied!', 'Post copied to clipboard');
                }}
                style={styles.largeButton}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Schedule Modal */}
      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedule}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  contentInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: Layout.spacing.xs,
  },
  charCount: {
    fontSize: Typography.fontSize.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
  },
  infoSection: {
    backgroundColor: Colors.gray100,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    padding: Layout.spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  discardButton: {
    padding: Layout.spacing.sm,
  },
  discardText: {
    fontSize: Typography.fontSize.md,
    color: Colors.error,
    fontWeight: Typography.fontWeight.medium,
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: Layout.spacing.xs,
  },
  smallButton: {
    flex: 1,
    paddingHorizontal: Layout.spacing.xs,
    minWidth: 0,
  },
  mediumButton: {
    flex: 1,
    paddingHorizontal: Layout.spacing.sm,
  },
  largeButton: {
    flex: 1,
  },
});
