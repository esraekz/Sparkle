import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation to AuthStack handled automatically by App.tsx
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user.full_name}</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>

            <Text style={styles.label}>User ID</Text>
            <Text style={styles.valueSmall}>{user.id}</Text>
          </View>
        )}

        <Text style={styles.subtitle}>
          User profile and settings will appear here
        </Text>

        <Button
          title="Logout"
          onPress={handleLogout}
          loading={isLoading}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
  },
  userInfo: {
    backgroundColor: Colors.gray100,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.xl,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },
  value: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  valueSmall: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },
  logoutButton: {
    marginTop: 'auto',
  },
});
