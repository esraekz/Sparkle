import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';

interface TextInputProps extends RNTextInputProps {
  label: string;
  error?: string;
  secureTextEntry?: boolean;
}

export default function TextInput({
  label,
  error,
  secureTextEntry = false,
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPassword = Boolean(secureTextEntry && !isPasswordVisible);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <RNTextInput
          style={styles.input}
          placeholderTextColor={Colors.gray500}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={showPassword}
          autoCapitalize="none"
          autoCorrect={Boolean(false)}
          {...props}
        />
        {Boolean(secureTextEntry) && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeText}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Layout.touchTarget.minHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Layout.spacing.md,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    paddingVertical: Layout.spacing.sm,
  },
  eyeButton: {
    padding: Layout.spacing.xs,
    marginLeft: Layout.spacing.sm,
  },
  eyeText: {
    fontSize: 20,
  },
  error: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: Layout.spacing.xs,
  },
});
