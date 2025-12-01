import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';
import Button from './Button';
import { aiService } from '../services/ai.service';
import type { AIAction, AIAssistResponse } from '../types';

interface AIActionsModalProps {
  visible: boolean;
  currentText: string;
  onClose: () => void;
  onApply: (result: AIAssistResponse) => void;
  onUseHook?: (hook: string) => void;
}

interface AIActionOption {
  id: AIAction;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const AI_ACTIONS: AIActionOption[] = [
  {
    id: 'continue',
    icon: '✏️',
    title: 'Continue Writing',
    description: 'Let AI continue your thought',
    color: Colors.primary,
  },
  {
    id: 'rephrase',
    icon: '🔄',
    title: 'Rephrase',
    description: 'Rewrite in different words',
    color: '#4A90E2',
  },
  {
    id: 'grammar',
    icon: '✅',
    title: 'Fix Grammar',
    description: 'Correct spelling & grammar',
    color: '#7ED321',
  },
  {
    id: 'engagement',
    icon: '💪',
    title: 'Improve Engagement',
    description: 'Make it more compelling',
    color: '#F5A623',
  },
  {
    id: 'shorter',
    icon: '✂️',
    title: 'Make Shorter',
    description: 'Condense without losing impact',
    color: '#BD10E0',
  },
];

export default function AIActionsModal({
  visible,
  currentText,
  onClose,
  onApply,
  onUseHook,
}: AIActionsModalProps) {
  const [result, setResult] = useState<AIAssistResponse | null>(null);
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const [hookUsed, setHookUsed] = useState(false);

  const aiMutation = useMutation({
    mutationFn: (action: AIAction) => aiService.generateContent(action, currentText),
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: any) => {
      Alert.alert(
        'AI Error',
        error.response?.data?.detail || error.message || 'Failed to generate content',
        [{ text: 'OK' }]
      );
    },
  });

  const handleActionPress = (action: AIAction) => {
    if (!currentText.trim()) {
      Alert.alert('Empty Text', 'Please write something first before using AI assistance');
      return;
    }

    setSelectedAction(action);
    setResult(null);
    setHookUsed(false); // Reset hook state when starting new action
    aiMutation.mutate(action);
  };

  const handleApply = () => {
    if (result) {
      // If hook was used, prepend it to the content
      const finalResult = hookUsed
        ? {
            ...result,
            content: `${result.hook_suggestion}\n\n${result.content}`,
          }
        : result;

      onApply(finalResult);
      handleClose();
    }
  };

  const handleUseHook = () => {
    if (result && onUseHook) {
      setHookUsed(true); // Track that hook was used
      onUseHook(result.hook_suggestion);
      Alert.alert('Hook Applied', 'The hook will be included when you apply changes', [
        { text: 'OK' }
      ]);
    }
  };

  const handleClose = () => {
    setResult(null);
    setSelectedAction(null);
    setHookUsed(false);
    onClose();
  };

  const getSelectedActionInfo = () => {
    return AI_ACTIONS.find((a) => a.id === selectedAction);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>✨ Sparkle AI</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {!result ? (
              <>
                {/* Action Selection */}
                <Text style={styles.sectionTitle}>
                  {aiMutation.isPending ? 'Generating with AI...' : 'Choose an AI action:'}
                </Text>

                <View style={styles.actionsGrid}>
                  {AI_ACTIONS.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={[
                        styles.actionCard,
                        selectedAction === action.id && styles.actionCardActive,
                      ]}
                      onPress={() => handleActionPress(action.id)}
                      disabled={aiMutation.isPending}
                    >
                      <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>{action.icon}</Text>
                      </View>
                      <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                        <Text style={styles.actionDescription}>{action.description}</Text>
                      </View>

                      {aiMutation.isPending && selectedAction === action.id && (
                        <View style={styles.loadingOverlay}>
                          <ActivityIndicator color={Colors.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {!currentText.trim() && (
                  <View style={styles.emptyTextNotice}>
                    <Text style={styles.emptyTextText}>
                      💡 Write some content first, then choose an AI action to improve it!
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Result Preview */}
                <View style={styles.resultHeader}>
                  <View style={styles.resultActionInfo}>
                    <Text style={styles.resultActionIcon}>
                      {getSelectedActionInfo()?.icon}
                    </Text>
                    <Text style={styles.resultActionTitle}>
                      {getSelectedActionInfo()?.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setResult(null)}
                    style={styles.tryAnotherButton}
                  >
                    <Text style={styles.tryAnotherText}>Try Another</Text>
                  </TouchableOpacity>
                </View>

                {/* Generated Content */}
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Generated Content:</Text>
                  <View style={styles.resultContentBox}>
                    <Text style={styles.resultContentText}>{result.content}</Text>
                  </View>
                </View>

                {/* Generated Hashtags */}
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Suggested Hashtags:</Text>
                  <View style={styles.hashtagsContainer}>
                    {result.hashtags.map((tag, index) => (
                      <View key={index} style={styles.hashtagPill}>
                        <Text style={styles.hashtagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Hook Suggestion */}
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Alternative Hook:</Text>
                  <View style={styles.hookBox}>
                    <Text style={styles.hookText}>{result.hook_suggestion}</Text>
                  </View>
                  <Text style={styles.hookHint}>
                    💡 Consider using this as your opening line for better engagement
                  </Text>
                  {onUseHook && (
                    <TouchableOpacity style={styles.useHookButton} onPress={handleUseHook}>
                      <Text style={styles.useHookButtonText}>Use This Hook</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Actions */}
          {result && (
            <View style={styles.footer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.footerButton}
              />
              <Button
                title="Apply Changes"
                variant="primary"
                onPress={handleApply}
                style={styles.footerButton}
              />
            </View>
          )}
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
    backgroundColor: Colors.background,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    height: '70%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  actionsGrid: {
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
  },
  actionCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    position: 'relative',
  },
  actionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF9E6',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  actionIconText: {
    fontSize: 18,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.lg,
  },
  emptyTextNotice: {
    backgroundColor: '#E3F2FD',
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  emptyTextText: {
    fontSize: Typography.fontSize.sm,
    color: '#1976D2',
    textAlign: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  resultActionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  resultActionIcon: {
    fontSize: 24,
  },
  resultActionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  tryAnotherButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tryAnotherText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  resultSection: {
    marginBottom: Layout.spacing.lg,
  },
  resultLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultContentBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  resultContentText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
  },
  hashtagPill: {
    backgroundColor: '#E3F2FD',
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  hashtagText: {
    fontSize: Typography.fontSize.sm,
    color: '#1976D2',
    fontWeight: Typography.fontWeight.medium,
  },
  hookBox: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },
  hookText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  hookHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  useHookButton: {
    marginTop: Layout.spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  useHookButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    padding: Layout.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  footerButton: {
    flex: 1,
  },
});
