import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';

interface SparkleLoaderProps {
  message?: string;
}

export default function SparkleLoader({ message = 'Crafting your post...' }: SparkleLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing animation for the circle
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Sparkle animations with offset timing
    const sparkle1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle1, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkle1, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ])
    );

    const sparkle2Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(sparkle2, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkle2, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    rotateAnimation.start();
    sparkle1Animation.start();
    sparkle2Animation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      sparkle1Animation.stop();
      sparkle2Animation.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.loaderContainer}>
        {/* Main pulsing circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Sparkle stars container with rotation */}
          <Animated.View
            style={[
              styles.sparklesContainer,
              {
                transform: [{ rotate }],
              },
            ]}
          >
            {/* Sparkle 1 - top right */}
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkle1,
                {
                  opacity: sparkle1,
                  transform: [
                    {
                      scale: sparkle1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.sparkleText}>✨</Text>
            </Animated.View>

            {/* Sparkle 2 - bottom left */}
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkle2,
                {
                  opacity: sparkle2,
                  transform: [
                    {
                      scale: sparkle2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.sparkleText}>✨</Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Message text */}
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>AI is analyzing trends and your brand voice</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xl,
  },
  loaderContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.lg,
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sparklesContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 10,
    right: 10,
  },
  sparkle2: {
    bottom: 10,
    left: 10,
  },
  sparkleText: {
    fontSize: 28,
  },
  message: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.xs,
  },
  subMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
