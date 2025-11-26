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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Clipboard from 'expo-clipboard';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';
import Button from '../../components/Button';
import { postService } from '../../services/post.service';
import type { MainTabParamList } from '../../types';

type CreatePostScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Post'>;

const MAX_CHARS = 3000;

export default function CreatePostScreen() {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
        source_type: 'manual',
      });

      Alert.alert('Success', 'Draft saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setContent('');
            setHashtags('');
            navigation.goBack();
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
              navigation.goBack();
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

          {/* LinkedIn Preview (placeholder) */}
          <TouchableOpacity style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Text style={styles.sectionTitle}>LinkedIn Preview</Text>
              <Text style={styles.previewToggle}>Show ▼</Text>
            </View>
            <Text style={styles.previewHint}>
              See how your post will look on LinkedIn
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <Button
            title="Save Draft"
            variant="outline"
            onPress={handleSaveDraft}
            loading={isSaving}
            disabled={isSaving || !content.trim()}
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
  bottomBar: {
    flexDirection: 'row',
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
  actionButton: {
    flex: 1,
  },
});
