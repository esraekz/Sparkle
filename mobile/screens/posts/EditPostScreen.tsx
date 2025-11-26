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
  const [showPreview, setShowPreview] = useState(false);

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

  const handleSparkleAI = () => {
    Alert.alert(
      '✨ Sparkle AI',
      'AI-powered content generation coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleUploadImage = () => {
    Alert.alert(
      'Upload Image',
      'Image upload feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleGenerateImage = () => {
    Alert.alert(
      'Generate with AI',
      'AI image generation coming soon!',
      [{ text: 'OK' }]
    );
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
              placeholder="Write your post here or tap ✨ Sparkle AI to help you get started"
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

          {/* Sparkle AI Button */}
          <TouchableOpacity
            style={styles.sparkleButton}
            onPress={handleSparkleAI}
          >
            <Text style={styles.sparkleText}>✨ Sparkle AI</Text>
          </TouchableOpacity>

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
            <Text style={styles.hint}>
              Tip: Use 3-5 relevant hashtags for better reach
            </Text>
          </View>

          {/* Add Visual */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Visual</Text>
            <View style={styles.visualButtons}>
              <TouchableOpacity
                style={styles.visualButton}
                onPress={handleUploadImage}
              >
                <Text style={styles.visualButtonIcon}>📷</Text>
                <Text style={styles.visualButtonText}>Upload Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.visualButton, styles.visualButtonAI]}
                onPress={handleGenerateImage}
              >
                <Text style={styles.visualButtonIcon}>✨</Text>
                <Text style={styles.visualButtonTextAI}>Generate with AI</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* LinkedIn Preview */}
          <View style={styles.previewSection}>
            <TouchableOpacity
              style={styles.previewHeader}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Text style={styles.sectionTitle}>LinkedIn Preview</Text>
              <Text style={styles.previewToggle}>
                {showPreview ? 'Hide ▲' : 'Show ▼'}
              </Text>
            </TouchableOpacity>

            {!showPreview ? (
              <Text style={styles.previewHint}>
                See how your post will look on LinkedIn
              </Text>
            ) : (
              <View style={styles.linkedinPreview}>
                {/* LinkedIn Post Card */}
                <View style={styles.linkedinCard}>
                  {/* Header */}
                  <View style={styles.linkedinHeader}>
                    <View style={styles.linkedinAvatar}>
                      <Text style={styles.linkedinAvatarText}>👤</Text>
                    </View>
                    <View style={styles.linkedinHeaderText}>
                      <Text style={styles.linkedinName}>Your Name</Text>
                      <Text style={styles.linkedinMeta}>Your Headline • Now</Text>
                    </View>
                  </View>

                  {/* Content */}
                  {content.trim() ? (
                    <Text style={styles.linkedinContent}>{content}</Text>
                  ) : (
                    <Text style={styles.linkedinContentPlaceholder}>
                      Your post content will appear here...
                    </Text>
                  )}

                  {/* Hashtags */}
                  {hashtags.trim() && (
                    <View style={styles.linkedinHashtags}>
                      {parseHashtags(hashtags).map((tag, index) => (
                        <Text key={index} style={styles.linkedinHashtag}>
                          #{tag}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Engagement Bar */}
                  <View style={styles.linkedinEngagement}>
                    <Text style={styles.linkedinEngagementText}>👍 💡 👏</Text>
                    <Text style={styles.linkedinEngagementCount}>0 • 0 comments</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.linkedinActions}>
                    <View style={styles.linkedinAction}>
                      <Text style={styles.linkedinActionText}>👍 Like</Text>
                    </View>
                    <View style={styles.linkedinAction}>
                      <Text style={styles.linkedinActionText}>💬 Comment</Text>
                    </View>
                    <View style={styles.linkedinAction}>
                      <Text style={styles.linkedinActionText}>🔄 Repost</Text>
                    </View>
                    <View style={styles.linkedinAction}>
                      <Text style={styles.linkedinActionText}>📤 Send</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
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
          {/* Left side - Icon buttons */}
          <View style={styles.iconButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleDiscard}
              disabled={isSaving}
            >
              <Text style={styles.iconButtonText}>🗑️</Text>
            </TouchableOpacity>

            {post.status === 'draft' && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowScheduleModal(true)}
                disabled={isSaving || !content.trim() || isOverLimit}
              >
                <Text style={styles.iconButtonText}>📅</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Right side - Primary action buttons */}
          <View style={styles.primaryButtons}>
            {post.status === 'draft' && (
              <>
                <Button
                  title="Save Draft"
                  variant="outline"
                  onPress={handleSaveDraft}
                  loading={isSaving}
                  disabled={isSaving || !content.trim() || isOverLimit}
                  style={styles.actionButton}
                />
                <Button
                  title="Post Now"
                  variant="primary"
                  onPress={handlePostNow}
                  loading={isSaving}
                  disabled={isSaving || !content.trim() || isOverLimit}
                  style={styles.actionButton}
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
                  style={styles.actionButton}
                />
                <Button
                  title="Post Now"
                  variant="primary"
                  onPress={handlePostNow}
                  loading={isSaving}
                  disabled={isSaving || !content.trim() || isOverLimit}
                  style={styles.actionButton}
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
                style={styles.fullWidthButton}
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
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: 12,
    paddingBottom: Layout.spacing.lg,
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
    justifyContent: 'space-between',
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
  iconButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconButtonText: {
    fontSize: 20,
  },
  primaryButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
  sparkleButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.sm,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Layout.spacing.xs,
  },
  sparkleText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  hint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  visualButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  visualButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.sm,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  visualButtonAI: {
    backgroundColor: '#FFF9E6',
    borderColor: Colors.primary,
  },
  visualButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  visualButtonText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
  },
  visualButtonTextAI: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  previewSection: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  previewToggle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  previewHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  linkedinPreview: {
    marginTop: Layout.spacing.md,
  },
  linkedinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  linkedinHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  linkedinAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0077B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  linkedinAvatarText: {
    fontSize: 24,
  },
  linkedinHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  linkedinName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  linkedinMeta: {
    fontSize: 12,
    color: '#666666',
  },
  linkedinContent: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 8,
  },
  linkedinContentPlaceholder: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  linkedinHashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  linkedinHashtag: {
    fontSize: 14,
    color: '#0077B5',
    marginRight: 8,
    marginBottom: 4,
  },
  linkedinEngagement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  linkedinEngagementText: {
    fontSize: 12,
  },
  linkedinEngagementCount: {
    fontSize: 12,
    color: '#666666',
  },
  linkedinActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  linkedinAction: {
    alignItems: 'center',
  },
  linkedinActionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});
