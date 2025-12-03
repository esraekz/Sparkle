import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';
import Button from './Button';

interface AIImageModalProps {
  visible: boolean;
  postContent: string;
  onClose: () => void;
  onGenerate: () => Promise<void>;
  isGenerating?: boolean;
}

type ImageSource = 'post_content' | 'custom';

interface SourceOption {
  id: ImageSource;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
}

const SOURCE_OPTIONS: SourceOption[] = [
  {
    id: 'post_content',
    icon: '✨',
    title: 'From your post',
    description: 'AI analyzes your content and creates a matching visual',
    enabled: true,
  },
  {
    id: 'custom',
    icon: '🎨',
    title: 'Custom description',
    description: 'Describe exactly what you want to see',
    enabled: false, // Phase 2
  },
];

export default function AIImageModal({
  visible,
  postContent,
  onClose,
  onGenerate,
  isGenerating = false,
}: AIImageModalProps) {
  const [selectedSource, setSelectedSource] = useState<ImageSource>('post_content');

  const handleContinue = async () => {
    // For Phase 1, only post_content is supported
    if (selectedSource === 'post_content') {
      await onGenerate();
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedSource('post_content'); // Reset to default
    onClose();
  };

  // Check if user has written enough content
  const hasEnoughContent = postContent.trim().length >= 20;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Close Button */}
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Generate Image</Text>
            <Text style={styles.subtitle}>Choose your generation method</Text>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Source Options */}
            {SOURCE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedSource === option.id && option.enabled && styles.optionCardSelected,
                  !option.enabled && styles.optionCardDisabled,
                ]}
                onPress={() => {
                  if (option.enabled) {
                    setSelectedSource(option.id);
                  }
                }}
                disabled={!option.enabled}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View style={[
                  styles.iconContainer,
                  selectedSource === option.id && option.enabled && styles.iconContainerSelected,
                  !option.enabled && styles.iconContainerDisabled,
                ]}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                </View>

                {/* Text */}
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    !option.enabled && styles.optionTitleDisabled,
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    !option.enabled && styles.optionDescriptionDisabled,
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Warning if content too short */}
            {!hasEnoughContent && selectedSource === 'post_content' && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  Write at least 20 characters of content to generate an image
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleClose}
              style={styles.footerButton}
              disabled={isGenerating}
            />
            <Button
              title={isGenerating ? "Generating..." : "Continue"}
              variant="primary"
              onPress={handleContinue}
              disabled={!hasEnoughContent || selectedSource !== 'post_content' || isGenerating}
              loading={isGenerating}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, // Extra padding for iOS safe area
    maxHeight: '85%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.bold,
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  content: {
    maxHeight: 400,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#FFFBF0',
    borderColor: Colors.primary,
  },
  optionCardDisabled: {
    backgroundColor: '#F1F3F5',
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: '#FFF8E1',
  },
  iconContainerDisabled: {
    backgroundColor: '#E9ECEF',
  },
  optionIcon: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  optionTitleDisabled: {
    color: Colors.gray500,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  optionDescriptionDisabled: {
    color: Colors.gray400,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: Layout.spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#856404',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});
