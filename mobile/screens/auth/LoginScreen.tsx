import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, type LoginFormData } from '../../utils/validation';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      // Reset errors
      setErrors({});

      // Validate form data with Zod
      const validatedData = loginSchema.parse(formData);

      // Start loading
      setIsLoading(true);

      // Call login from AuthContext
      await login(validatedData);

      // Success - navigation handled by App.tsx based on auth state
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const validationErrors: Partial<LoginFormData> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof LoginFormData;
          validationErrors[field] = err.message;
        });
        setErrors(validationErrors);
      } else {
        // API error
        Alert.alert(
          'Login Failed',
          error.response?.data?.detail || error.message || 'Please try again'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear App Data',
      'This will clear all stored data including auth tokens and onboarding progress. Use this to test with a fresh state.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'App data cleared. Please reload the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>✨</Text>
            <Text style={styles.title}>Welcome to Sparkle</Text>
            <Text style={styles.subtitle}>
              Your AI personal-branding copilot for LinkedIn
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
              secureTextEntry={true}
              autoComplete="password"
              textContentType="password"
            />

            <Button
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Phase 1: Using mock authentication
            </Text>
            <TouchableOpacity onPress={handleClearData} style={styles.clearDataButton}>
              <Text style={styles.clearDataText}>Clear App Data (Dev)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Layout.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: Layout.spacing.xxl,
    marginBottom: Layout.spacing.xl,
  },
  logo: {
    fontSize: 60,
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },
  form: {
    marginTop: Layout.spacing.lg,
  },
  loginButton: {
    marginTop: Layout.spacing.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  signupText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Layout.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  clearDataButton: {
    marginTop: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
  },
  clearDataText: {
    fontSize: Typography.fontSize.xs,
    color: '#FF6B6B',
    fontWeight: Typography.fontWeight.semibold,
  },
});
