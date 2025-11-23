/**
 * Onboarding Step 6: Posting Preferences
 * User sets posting frequency, preferred days, time, and review preference
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Onboarding4: undefined;
  Onboarding5: undefined;
  Onboarding6: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding6'>;
};

// Posting frequency options (matching mockup)
const FREQUENCIES = [
  { value: 1, label: '1x/week' },
  { value: 2, label: '2-3x/week' },
  { value: 7, label: 'Every day' },
];

// Days of week (matching mockup)
const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

export default function Onboarding6Screen({ navigation }: Props) {
  const {
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

  const [localFrequency, setLocalFrequency] = useState(postingFrequency || 2);
  const [localDays, setLocalDays] = useState<string[]>(
    preferredDays.length > 0 ? preferredDays : ['tuesday', 'thursday', 'saturday']
  );
  const [localTime, setLocalTime] = useState(preferredTime || '14');
  const [localAskBeforePublish, setLocalAskBeforePublish] = useState(askBeforePublish);

  const toggleDay = (dayId: string) => {
    if (localDays.includes(dayId)) {
      if (localDays.length === 1) {
        Alert.alert('At Least One Day', 'Please select at least one preferred day.');
        return;
      }
      setLocalDays(localDays.filter((d) => d !== dayId));
    } else {
      setLocalDays([...localDays, dayId]);
    }
  };

  const handleComplete = async () => {
    // Validation
    if (!localFrequency || localFrequency === 0) {
      Alert.alert('Missing Information', 'Please select your posting frequency.');
      return;
    }
    if (localDays.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one preferred day.');
      return;
    }

    try {
      // Update context
      setPostingFrequency(localFrequency);
      setPreferredDays(localDays);
      setPreferredTime(localTime);
      setAskBeforePublish(localAskBeforePublish);

      // Submit to backend
      await submitBlueprint();

      // Navigation will happen automatically via App.tsx useEffect
      console.log('[Onboarding6] Blueprint submitted successfully');
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
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      {/* ScrollView with all content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={styles.title}>Let's set up your posting schedule</Text>
        <Text style={styles.subtitle}>Customize how often and when you post</Text>

        {/* Posting Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How often would you like to post?</Text>
          <View style={styles.frequencyContainer}>
            {FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                style={[styles.freqChip, localFrequency === freq.value && styles.freqChipSelected]}
                onPress={() => setLocalFrequency(freq.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.freqChipText, localFrequency === freq.value && styles.freqChipTextSelected]}>
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Review Before Publishing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Always ask before publishing?</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Review before posting</Text>
            <Switch
              value={localAskBeforePublish}
              onValueChange={setLocalAskBeforePublish}
              trackColor={{ false: '#D1D1D1', true: '#F5C842' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D1D1"
            />
          </View>
        </View>

        {/* Preferred Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred posting days</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayChip, localDays.includes(day.id) && styles.dayChipSelected]}
                onPress={() => toggleDay(day.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayChipText, localDays.includes(day.id) && styles.dayChipTextSelected]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Best Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best time to post</Text>
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{localTime}:00</Text>
          </View>
          <Text style={styles.timeHint}>We'll suggest the best time based on your audience</Text>
        </View>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleComplete}
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
    paddingVertical: 12,
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
    paddingTop: 12,
    paddingBottom: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 18,
    textAlign: 'center',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  freqChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    minHeight: 40,
    justifyContent: 'center',
  },
  freqChipSelected: {
    backgroundColor: '#F5C842',
    borderColor: '#F5C842',
  },
  freqChipText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  freqChipTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    minHeight: 50,
  },
  switchLabel: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayChip: {
    minWidth: 48,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: '#F5C842',
    borderColor: '#F5C842',
  },
  dayChipText: {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  dayChipTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  timeDisplay: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timeHint: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 8,
  },
});
