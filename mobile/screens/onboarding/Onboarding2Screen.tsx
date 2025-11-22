/**
 * Onboarding Screen 2: Topic Selection
 * User selects 3-5 topics they want to be known for
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../../components/Button';

type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding2'>;
};

// Available topics with emojis
const AVAILABLE_TOPICS = [
  { id: 'AI', label: 'AI', emoji: '🤖' },
  { id: 'Leadership', label: 'Leadership', emoji: '👔' },
  { id: 'Data', label: 'Data', emoji: '📊' },
  { id: 'Finance', label: 'Finance', emoji: '💰' },
  { id: 'Innovation', label: 'Innovation', emoji: '💡' },
  { id: 'Startups', label: 'Startups', emoji: '🚀' },
  { id: 'Marketing', label: 'Marketing', emoji: '📱' },
  { id: 'Strategy', label: 'Strategy', emoji: '🎯' },
  { id: 'Engineering', label: 'Engineering', emoji: '⚙️' },
  { id: 'Design', label: 'Design', emoji: '🎨' },
  { id: 'Product', label: 'Product', emoji: '📦' },
  { id: 'Growth', label: 'Growth', emoji: '📈' },
];

export default function Onboarding2Screen({ navigation }: Props) {
  const { topics, setTopics } = useOnboarding();
  const [selectedTopics, setSelectedTopics] = useState<string[]>(topics);

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topicId));
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };

  const handleNext = () => {
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
      {/* Progress indicator */}
      <View style={styles.header}>
        <Text style={styles.progress}>Step 1 of 2</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Pick the topics you want to be known for</Text>
        <Text style={styles.subtitle}>Select 3-5 topics that align with your expertise</Text>

        {/* Topic chips */}
        <View style={styles.topicsContainer}>
          {AVAILABLE_TOPICS.map((topic) => (
            <TopicChip
              key={topic.id}
              topic={topic}
              selected={selectedTopics.includes(topic.id)}
              onPress={() => toggleTopic(topic.id)}
            />
          ))}
        </View>

        {/* Selected count */}
        {selectedTopics.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
          </Text>
        )}
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Next"
          onPress={handleNext}
          disabled={selectedTopics.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

function TopicChip({
  topic,
  selected,
  onPress,
}: {
  topic: { id: string; label: string; emoji: string };
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.chipEmoji}>{topic.emoji}</Text>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {topic.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  progress: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 22,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    minHeight: 44, // iOS HIG minimum touch target
    gap: 8,
  },
  chipSelected: {
    backgroundColor: '#FFF9E6',
    borderColor: '#F5C842',
  },
  chipEmoji: {
    fontSize: 20,
  },
  chipText: {
    fontSize: 15,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
