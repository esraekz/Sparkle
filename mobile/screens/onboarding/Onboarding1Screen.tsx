/**
 * Onboarding Step 1: Welcome Screen
 * Introduction to Sparkle and start of brand blueprint setup
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding1'>;
};

export default function Onboarding1Screen({ navigation }: Props) {
  const handleStart = () => {
    navigation.navigate('Onboarding2');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Sparkle Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.sparkleIcon}>✨</Text>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Sparkle</Text>

        {/* Welcome Message */}
        <Text style={styles.welcomeTitle}>
          Hi, I'm Sparkle — your personal branding copilot
        </Text>

        {/* Subtitle */}
        <Text style={styles.welcomeSubtitle}>
          Let's build your brand blueprint together so every post sounds uniquely you.
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <Button title="Let's Start" onPress={handleStart} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  sparkleIcon: {
    fontSize: 80,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 32,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});
