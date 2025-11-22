import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] Error caught:', error);
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    console.error('[ErrorBoundary] Error:', error);
    console.error('[ErrorBoundary] Error message:', error.message);
    console.error('[ErrorBoundary] Error stack:', error.stack);

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚠️ Error Caught</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
            {this.state.error?.stack && (
              <View style={styles.stackContainer}>
                <Text style={styles.stackTitle}>Stack Trace:</Text>
                <Text style={styles.stackText}>{this.state.error.stack}</Text>
              </View>
            )}
            {this.state.errorInfo?.componentStack && (
              <View style={styles.stackContainer}>
                <Text style={styles.stackTitle}>Component Stack:</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error,
    marginBottom: Layout.spacing.md,
  },
  errorMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  stackContainer: {
    marginTop: Layout.spacing.md,
    backgroundColor: Colors.gray100,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  stackTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  stackText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: 'Courier',
  },
});
