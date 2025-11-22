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
import { useAuth } from '../../contexts/AuthContext';
import { signupSchema, type SignupFormData } from '../../utils/validation';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signup } = useAuth();

  const [formData, setFormData] = useState<SignupFormData>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    try {
      // Reset errors
      setErrors({});

      // Validate form data with Zod
      const validatedData = signupSchema.parse(formData);

      // Start loading
      setIsLoading(true);

      // Call signup from AuthContext (remove confirmPassword)
      const { confirmPassword, ...signupData } = validatedData;
      await signup(signupData);

      // Success - navigation handled by App.tsx based on auth state
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const validationErrors: Partial<SignupFormData> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof SignupFormData;
          validationErrors[field] = err.message;
        });
        setErrors(validationErrors);
      } else {
        // API error
        Alert.alert(
          'Signup Failed',
          error.response?.data?.detail || error.message || 'Please try again'
        );
      }
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Sparkle and grow your LinkedIn presence
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              error={errors.full_name}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />

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
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
              secureTextEntry={Boolean(true)}
              autoComplete="password-new"
              textContentType="newPassword"
            />

            <TextInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              error={errors.confirmPassword}
              secureTextEntry={Boolean(true)}
              autoComplete="password-new"
              textContentType="newPassword"
            />

            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={isLoading}
              style={styles.signupButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Phase 1: Using mock authentication
            </Text>
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
    marginTop: Layout.spacing.xl,
    marginBottom: Layout.spacing.lg,
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
    marginTop: Layout.spacing.md,
  },
  signupButton: {
    marginTop: Layout.spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  loginText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  loginLink: {
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
});
