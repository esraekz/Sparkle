/**
 * Onboarding Step 2: Topics of Interest
 * User selects 3-5 topics they want to be known for
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../../components/Button';

type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Onboarding4: undefined;
  Onboarding5: undefined;
  Onboarding6: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding2'>;
};

// Available topics with emojis (matching mockup)
const AVAILABLE_TOPICS = [
  { id: 'AI', label: 'AI', emoji: '🤖' },
  { id: 'Leadership', label: 'Leadership', emoji: '👔' },
  { id: 'Finance', label: 'Finance', emoji: '💰' },
  { id: 'Data', label: 'Data', emoji: '📊' },
  { id: 'Innovation', label: 'Innovation', emoji: '💡' },
  { id: 'Startups', label: 'Startups', emoji: '🚀' },
  { id: 'Marketing', label: 'Marketing', emoji: '📈' },
  { id: 'Strategy', label: 'Strategy', emoji: '🎯' },
  { id: 'Engineering', label: 'Engineering', emoji: '⚙️' },
  { id: 'Design', label: 'Design', emoji: '🎨' },
  { id: 'Product', label: 'Product', emoji: '📱' },
  { id: 'Growth', label: 'Growth', emoji: '📈' },
];

export default function Onboarding2Screen({ navigation }: Props) {
  const { topics, setTopics } = useOnboarding();
  const [selectedTopics, setSelectedTopics] = useState<string[]>(topics);

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topicId));
    } else {
      if (selectedTopics.length >= 5) {
        Alert.alert('Maximum Reached', 'You can select up to 5 topics.');
        return;
      }
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };

  const handleContinue = () => {
    if (selectedTopics.length === 0) {
      Alert.alert('Select Topics', 'Please select at least 1 topic to continue.');
      return;
    }

    // Save to context
    setTopics(selectedTopics);

    // Navigate to next screen
    navigation.navigate('Onboarding3');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* ScrollView with all content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        style={styles.scrollView}
      >
        {/* Title */}
        <Text style={styles.title}>Pick the topics you want to be known for</Text>
        <Text style={styles.subtitle}>Select 3-5 areas that align with your expertise</Text>

        {/* Topic chips in 2-column grid */}
        <View style={styles.topicsContainer}>
          {AVAILABLE_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={[styles.chip, selectedTopics.includes(topic.id) && styles.chipSelected]}
              onPress={() => toggleTopic(topic.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipEmoji}>{topic.emoji}</Text>
              <Text style={[styles.chipText, selectedTopics.includes(topic.id) && styles.chipTextSelected]}>
                {topic.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected count - always render to maintain consistent height */}
        <Text style={styles.selectedCount}>
          {selectedTopics.length > 0 ? `${selectedTopics.length} of 5 selected` : ' '}
        </Text>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={selectedTopics.length === 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#F5C842',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  dotActive: {
    backgroundColor: '#F5C842',
    width: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 18,
    textAlign: 'center',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    minHeight: 48,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: '#F5C842',
    borderColor: '#F5C842',
  },
  chipEmoji: {
    fontSize: 20,
  },
  chipText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
