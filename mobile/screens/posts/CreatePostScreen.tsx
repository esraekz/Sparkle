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
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';
import Button from '../../components/Button';
import ScheduleModal from '../../components/ScheduleModal';
import AIActionsModal from '../../components/AIActionsModal';
import { postService } from '../../services/post.service';
import type { MainTabParamList, PostStackParamList, AIAssistResponse } from '../../types';

type CreatePostScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PostStackParamList, 'CreatePost'>,
  BottomTabNavigationProp<MainTabParamList>
>;

const MAX_CHARS = 3000;

export default function CreatePostScreen() {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Publish post mutation
  const publishPostMutation = useMutation({
    mutationFn: postService.publishPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Schedule post mutation
  const schedulePostMutation = useMutation({
    mutationFn: (data: { postId: string; scheduledFor: string }) =>
      postService.schedulePost(data.postId, data.scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleSparkleAI = () => {
    setShowAIModal(true);
  };

  const handleAIApply = (result: AIAssistResponse) => {
    setContent(result.content);
    setHashtags(result.hashtags.join(', '));
  };

  const handleUseHook = (hook: string) => {
    // Prepend the hook to the current content
    const currentContent = content.trim();
    const newContent = currentContent
      ? `${hook}\n\n${currentContent}`
      : hook;
    setContent(newContent);
  };

  const handleUploadImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Check file size (max 2MB)
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            'Please select an image smaller than 2MB',
            [{ text: 'OK' }]
          );
          return;
        }

        // Store local URI for preview
        setSelectedImageUri(asset.uri);

        // Upload to backend
        setIsUploadingImage(true);
        try {
          const imageUrl = await postService.uploadImage(asset.uri);
          setUploadedImageUrl(imageUrl);
        } catch (error: any) {
          Alert.alert('Upload Failed', error.message || 'Failed to upload image');
          setSelectedImageUri(null);
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageUri(null);
    setUploadedImageUrl(null);
  };

  const handleGenerateImage = () => {
    Alert.alert(
      'Generate with AI',
      'AI image generation coming soon!',
      [{ text: 'OK' }]
    );
  };

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
      await createPostMutation.mutateAsync({
        content: content.trim(),
        hashtags: parseHashtags(hashtags),
        image_url: uploadedImageUrl,
        source_type: 'manual',
      });

      Alert.alert('Success', 'Draft saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setContent('');
            setHashtags('');
            setSelectedImageUri(null);
            setUploadedImageUrl(null);
            navigation.navigate('PostsList');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save draft');
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
      // First create the post
      const post = await createPostMutation.mutateAsync({
        content: content.trim(),
        hashtags: parseHashtags(hashtags),
        image_url: uploadedImageUrl,
        source_type: 'manual',
      });

      // Then publish it
      await publishPostMutation.mutateAsync(post.id);

      // Copy to clipboard
      await Clipboard.setStringAsync(content.trim());

      Alert.alert(
        'Success! 🎉',
        'Post published and copied to clipboard. Paste it on LinkedIn now!',
        [
          {
            text: 'OK',
            onPress: () => {
              setContent('');
              setHashtags('');
              setSelectedImageUri(null);
              setUploadedImageUrl(null);
              navigation.navigate('PostsList');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to publish post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async (scheduledDate: Date) => {
    setShowScheduleModal(false);
    setIsSaving(true);
    try {
      // First save as draft
      const post = await createPostMutation.mutateAsync({
        content: content.trim(),
        hashtags: parseHashtags(hashtags),
        image_url: uploadedImageUrl,
        source_type: 'manual',
      });

      // Then schedule
      await schedulePostMutation.mutateAsync({
        postId: post.id,
        scheduledFor: scheduledDate.toISOString(),
      });

      Alert.alert('Success', 'Post scheduled successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setContent('');
            setHashtags('');
            setSelectedImageUri(null);
            setUploadedImageUrl(null);
            navigation.navigate('PostsList');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to schedule post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Post',
      'Are you sure you want to discard this post? All changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setContent('');
            setHashtags('');
            setSelectedImageUri(null);
            setUploadedImageUrl(null);
            navigation.navigate('PostsList');
          },
        },
      ]
    );
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const charCountColor = isOverLimit ? Colors.error : Colors.textSecondary;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
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

            {/* Always show action buttons first */}
            <View style={styles.visualButtons}>
              <TouchableOpacity
                style={styles.visualButton}
                onPress={handleUploadImage}
                disabled={isUploadingImage}
              >
                <Text style={styles.visualButtonIcon}>📷</Text>
                <Text style={styles.visualButtonText}>
                  {selectedImageUri ? 'Replace Image' : 'Upload Image'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.visualButton, styles.visualButtonAI]}
                onPress={handleGenerateImage}
                disabled={isUploadingImage}
              >
                <Text style={styles.visualButtonIcon}>✨</Text>
                <Text style={styles.visualButtonTextAI}>Generate with AI</Text>
              </TouchableOpacity>
            </View>

            {/* Image preview below buttons */}
            {selectedImageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                {isUploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                  disabled={isUploadingImage}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
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

                  {/* Image Preview in LinkedIn Card */}
                  {selectedImageUri && (
                    <Image
                      source={{ uri: selectedImageUri }}
                      style={styles.linkedinImage}
                      resizeMode="cover"
                    />
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

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowScheduleModal(true)}
              disabled={isSaving || !content.trim() || isOverLimit}
            >
              <Text style={styles.iconButtonText}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Right side - Primary action buttons */}
          <View style={styles.primaryButtons}>
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
          </View>
        </View>

        {/* Schedule Modal */}
        <ScheduleModal
          visible={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleSchedule}
        />

        {/* AI Actions Modal */}
        <AIActionsModal
          visible={showAIModal}
          currentText={content}
          onClose={() => setShowAIModal(false)}
          onApply={handleAIApply}
          onUseHook={handleUseHook}
        />
      </KeyboardAvoidingView>
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
  sparkleSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    opacity: 0.7,
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
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Layout.spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray100,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: Layout.spacing.sm,
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  removeImageText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
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
  linkedinImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: Colors.gray100,
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
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
