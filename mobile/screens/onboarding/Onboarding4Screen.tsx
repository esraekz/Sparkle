/**
 * Onboarding Step 4: Inspiration
 * User enters names of creators or posts that inspire them (optional)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding4'>;
};

export default function Onboarding4Screen({ navigation }: Props) {
  const { inspirations, setInspirations } = useOnboarding();
  const [inputText, setInputText] = useState(inspirations);

  const handleContinue = () => {
    // Save to context (optional field, so no validation needed)
    setInspirations(inputText);

    // Navigate to next screen
    navigation.navigate('Onboarding5');
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
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* ScrollView with all content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={styles.title}>Whose posts inspire you the most?</Text>
          <Text style={styles.subtitle}>
            This helps us understand your preferred style (optional)
          </Text>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Type a few names or paste post links..."
            placeholderTextColor="#999999"
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Example text */}
          <Text style={styles.exampleText}>e.g., Andrew Ng, Satya Nadella{'\n'}or LinkedIn post URLs</Text>

          {/* Info box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Tip:</Text> We'll analyze their tone and style to help personalize your posts.
            </Text>
          </View>

          {/* Continue button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Continue"
              onPress={handleContinue}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
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
    paddingTop: 32,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 22,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 120,
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    marginBottom: 24,
    paddingLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1A5A8A',
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 16,
  },
});
