import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import PostStackNavigator from './PostStackNavigator';
import SocialScreen from '../screens/social/SocialScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Import types
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBackground,
          height: Layout.tabBar.height,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: Colors.text,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false, // Hide header - HomeScreen has its own
          tabBarIcon: ({ color, size }) => (
            // TODO: Replace with proper icon component
            <HomeIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Post"
        component={PostStackNavigator}
        options={{
          title: 'Posts',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            // TODO: Replace with proper icon component
            <PlusIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          title: 'Social',
          tabBarIcon: ({ color, size }) => (
            // TODO: Replace with proper icon component
            <CommunityIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            // TODO: Replace with proper icon component
            <ChartIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            // TODO: Replace with proper icon component
            <PersonIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Temporary placeholder icon components
// TODO: Replace with @expo/vector-icons or react-native-vector-icons
function HomeIcon({ color, size }: { color: string; size: number }) {
  return null; // Placeholder
}

function PlusIcon({ color, size }: { color: string; size: number }) {
  return null; // Placeholder
}

function CommunityIcon({ color, size }: { color: string; size: number }) {
  return null; // Placeholder
}

function ChartIcon({ color, size }: { color: string; size: number }) {
  return null; // Placeholder
}

function PersonIcon({ color, size }: { color: string; size: number }) {
  return null; // Placeholder
}
