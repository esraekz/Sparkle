import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {Boolean(loading) ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'outline' && styles.outlineText,
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Layout.touchTarget.minHeight,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.gray200,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
    opacity: 0.6,
  },
  text: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.text,
  },
  outlineText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.gray600,
  },
});
