/**
 * Onboarding Step 5: Voice & Tone
 * User selects the tone that represents their voice
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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding5'>;
};

// Tone options with emojis and descriptions (matching mockup)
const TONES = [
  {
    id: 'warm_authentic',
    emoji: '💛',
    label: 'Warm & Authentic',
    description: 'Friendly, relatable, human-centered',
  },
  {
    id: 'professional_thoughtful',
    emoji: '💬',
    label: 'Professional & Thoughtful',
    description: 'Polished, measured, business-focused',
  },
  {
    id: 'bold_innovative',
    emoji: '⚡',
    label: 'Bold & Innovative',
    description: 'Daring, forward-thinking, trendsetter',
  },
  {
    id: 'analytical_insightful',
    emoji: '💡',
    label: 'Analytical & Insightful',
    description: 'Data-driven, deep-thinking, educational',
  },
  {
    id: 'assertive_confident',
    emoji: '🎯',
    label: 'Assertive & Confident',
    description: 'Direct, decisive, leadership-focused',
  },
];

export default function Onboarding5Screen({ navigation }: Props) {
  const { tone, setTone } = useOnboarding();
  const [selectedTone, setSelectedTone] = useState(tone);

  const handleContinue = () => {
    if (!selectedTone) {
      Alert.alert('Select Tone', 'Please select a tone to continue.');
      return;
    }

    // Save to context
    setTone(selectedTone);

    // Navigate to next screen
    navigation.navigate('Onboarding6');
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
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      {/* ScrollView with all content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        style={styles.scrollView}
      >
        {/* Title */}
        <Text style={styles.title}>What tone sounds most like you?</Text>
        <Text style={styles.subtitle}>Pick the tone that represents your voice</Text>

        {/* Tone options */}
        <View style={styles.tonesContainer}>
          {TONES.map((toneOption) => (
            <TouchableOpacity
              key={toneOption.id}
              style={[styles.toneCard, selectedTone === toneOption.id && styles.toneCardSelected]}
              onPress={() => setSelectedTone(toneOption.id)}
              activeOpacity={0.7}
            >
              <View style={styles.toneHeader}>
                <Text style={styles.toneEmoji}>{toneOption.emoji}</Text>
                <Text style={[styles.toneLabel, selectedTone === toneOption.id && styles.toneLabelSelected]}>
                  {toneOption.label}
                </Text>
              </View>
              <Text style={styles.toneDescription}>{toneOption.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedTone}
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  tonesContainer: {
    marginBottom: 20,
  },
  toneCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    minHeight: 72,
  },
  toneCardSelected: {
    borderColor: '#F5C842',
    backgroundColor: '#FFF9E6',
  },
  toneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  toneEmoji: {
    fontSize: 18,
  },
  toneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  toneLabelSelected: {
    fontWeight: '700',
  },
  toneDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
