/**
 * Onboarding Screen 1: Welcome
 * Introduction to Sparkle and brand blueprint concept
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../../components/Button';

type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding1'>;
};

export default function Onboarding1Screen({ navigation }: Props) {
  const handleGetStarted = () => {
    navigation.navigate('Onboarding2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>✨</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Hi, I'm Sparkle</Text>
        <Text style={styles.subtitle}>Your personal branding copilot</Text>

        {/* Description */}
        <Text style={styles.description}>
          Let's build your brand blueprint together so every post sounds uniquely you.
        </Text>

        {/* Feature highlights */}
        <View style={styles.features}>
          <FeatureItem emoji="🎯" text="AI that matches your voice" />
          <FeatureItem emoji="📰" text="Posts from trending news" />
          <FeatureItem emoji="⏰" text="Smart scheduling" />
          <FeatureItem emoji="📊" text="Analytics & insights" />
        </View>
      </View>

      {/* Bottom button */}
      <View style={styles.buttonContainer}>
        <Button title="Get Started" onPress={handleGetStarted} />
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5C842',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  features: {
    width: '100%',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
