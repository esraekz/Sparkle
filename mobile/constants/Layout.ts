import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Layout constants following iOS Human Interface Guidelines
 * Minimum touch target: 44x44pt (iOS), 48x48dp (Android)
 */

export const Layout = {
  // Screen dimensions
  window: {
    width,
    height,
  },

  // Spacing system (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },

  // Touch targets (following iOS HIG: 44x44pt minimum)
  touchTarget: {
    minHeight: Platform.select({
      ios: 44,
      android: 48,
      default: 44,
    }),
    minWidth: Platform.select({
      ios: 44,
      android: 48,
      default: 44,
    }),
  },

  // Safe area defaults
  safeArea: {
    top: 44,
    bottom: 34,
  },

  // Tab bar
  tabBar: {
    height: Platform.select({
      ios: 83, // iOS tab bar with safe area
      android: 56, // Material Design bottom navigation
      default: 56,
    }),
  },

  // Header
  header: {
    height: Platform.select({
      ios: 44,
      android: 56,
      default: 44,
    }),
  },
};

export default Layout;
