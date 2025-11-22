/**
 * Onboarding Screen 3: Detailed Preferences
 * User sets goals, tone, posting preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding3'>;
};

// Goal options
const GOALS = [
  { id: 'build_thought_leadership', label: 'Build thought leadership' },
  { id: 'grow_audience', label: 'Grow my audience' },
  { id: 'increase_visibility', label: 'Increase visibility' },
  { id: 'attract_headhunters', label: 'Attract headhunters/clients' },
  { id: 'become_top_voice', label: 'Become a Top Voice' },
];

// Tone options
const TONES = [
  { id: 'warm_relatable', label: 'Warm & Authentic' },
  { id: 'professional_thoughtful', label: 'Professional & Thoughtful' },
  { id: 'innovative_creative', label: 'Bold & Innovative' },
  { id: 'analytical_insightful', label: 'Analytical & Insightful' },
  { id: 'assertive_expert', label: 'Assertive & Confident' },
];

// Posting frequency options
const FREQUENCIES = [
  { value: 1, label: '1x/week' },
  { value: 2, label: '2-3x/week' },
  { value: 3, label: '3-5x/week' },
  { value: 7, label: 'Every day' },
];

// Days of week
const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

export default function Onboarding3Screen({ navigation }: Props) {
  const {
    mainGoal,
    setMainGoal,
    tone,
    setTone,
    inspirations,
    setInspirations,
    postingFrequency,
    setPostingFrequency,
    preferredDays,
    setPreferredDays,
    preferredTime,
    setPreferredTime,
    askBeforePublish,
    setAskBeforePublish,
    submitBlueprint,
    isLoading,
  } = useOnboarding();

  const { checkAuth } = useAuth();

  const [localGoal, setLocalGoal] = useState(mainGoal);
  const [localTone, setLocalTone] = useState(tone);
  const [localInspirations, setLocalInspirations] = useState(inspirations);
  const [localFrequency, setLocalFrequency] = useState(postingFrequency);
  const [localDays, setLocalDays] = useState<string[]>(preferredDays);
  const [localTime, setLocalTime] = useState(preferredTime);
  const [localAskBeforePublish, setLocalAskBeforePublish] = useState(askBeforePublish);

  const toggleDay = (dayId: string) => {
    if (localDays.includes(dayId)) {
      setLocalDays(localDays.filter((d) => d !== dayId));
    } else {
      setLocalDays([...localDays, dayId]);
    }
  };

  const handleComplete = async () => {
    // Validation
    if (!localGoal) {
      Alert.alert('Missing Information', 'Please select your main goal.');
      return;
    }
    if (!localTone) {
      Alert.alert('Missing Information', 'Please select your tone.');
      return;
    }
    if (localDays.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one preferred posting day.');
      return;
    }

    try {
      // Update context
      setMainGoal(localGoal);
      setTone(localTone);
      setInspirations(localInspirations);
      setPostingFrequency(localFrequency);
      setPreferredDays(localDays);
      setPreferredTime(localTime);
      setAskBeforePublish(localAskBeforePublish);

      // Submit to backend
      await submitBlueprint();

      // Refresh auth state to navigate to home
      await checkAuth();
    } catch (error) {
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
      console.error('Onboarding submit error:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Setting up your brand blueprint..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.header}>
        <Text style={styles.progress}>Step 2 of 2</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Main Goal */}
        <Section title="What's your main goal on LinkedIn?">
          {GOALS.map((goal) => (
            <RadioButton
              key={goal.id}
              label={goal.label}
              selected={localGoal === goal.id}
              onPress={() => setLocalGoal(goal.id)}
            />
          ))}
        </Section>

        {/* Inspirations */}
        <Section
          title="Whose posts inspire you the most?"
          subtitle="Separate names with commas (optional)"
        >
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Simon Sinek, Brené Brown"
            value={localInspirations}
            onChangeText={setLocalInspirations}
            multiline={Boolean(true)}
            numberOfLines={2}
          />
        </Section>

        {/* Tone */}
        <Section title="Pick the tone that represents your voice">
          {TONES.map((toneOption) => (
            <RadioButton
              key={toneOption.id}
              label={toneOption.label}
              selected={localTone === toneOption.id}
              onPress={() => setLocalTone(toneOption.id)}
            />
          ))}
        </Section>

        {/* Posting Frequency */}
        <Section title="How often would you like to post?">
          <View style={styles.frequencyContainer}>
            {FREQUENCIES.map((freq) => (
              <FrequencyChip
                key={freq.value}
                label={freq.label}
                selected={localFrequency === freq.value}
                onPress={() => setLocalFrequency(freq.value)}
              />
            ))}
          </View>
        </Section>

        {/* Preferred Days */}
        <Section title="Preferred posting days">
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <DayChip
                key={day.id}
                label={day.label}
                selected={localDays.includes(day.id)}
                onPress={() => toggleDay(day.id)}
              />
            ))}
          </View>
        </Section>

        {/* Best Time */}
        <Section title="Best time to post" subtitle={`Currently set to ${localTime}:00`}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Hour (0-23):</Text>
            <TextInput
              style={styles.timeInput}
              keyboardType="number-pad"
              value={String(localTime)}
              onChangeText={(text) => {
                const hour = parseInt(text) || 0;
                if (hour >= 0 && hour <= 23) {
                  setLocalTime(hour);
                }
              }}
              maxLength={2}
            />
          </View>
        </Section>

        {/* Ask Before Publish */}
        <Section title="Publishing preference">
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Always ask before publishing</Text>
            <Switch
              value={Boolean(localAskBeforePublish)}
              onValueChange={setLocalAskBeforePublish}
              trackColor={{ false: '#D1D1D1', true: '#F5C842' }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : Boolean(localAskBeforePublish) ? '#F5C842' : '#F4F3F4'}
            />
          </View>
          <Text style={styles.switchHint}>
            When enabled, we'll notify you before publishing any scheduled posts
          </Text>
        </Section>
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.buttonContainer}>
        <Button title="Complete Setup" onPress={handleComplete} />
      </View>
    </SafeAreaView>
  );
}

// Reusable components
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

function RadioButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.radioButton} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function FrequencyChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.freqChip, selected && styles.freqChipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.freqChipText, selected && styles.freqChipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DayChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.dayChip, selected && styles.dayChipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.dayChipText, selected && styles.dayChipTextSelected]}>
        {label}
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 44,
    gap: 12,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D1D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#F5C842',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5C842',
  },
  radioLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  freqChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    minHeight: 44,
    justifyContent: 'center',
  },
  freqChipSelected: {
    backgroundColor: '#FFF9E6',
    borderColor: '#F5C842',
  },
  freqChipText: {
    fontSize: 15,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  freqChipTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: '#FFF9E6',
    borderColor: '#F5C842',
  },
  dayChipText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  dayChipTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    width: 60,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  switchHint: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
