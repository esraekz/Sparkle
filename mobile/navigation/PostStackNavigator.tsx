import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Colors from '../constants/Colors';

// Import screens
import PostsListScreen from '../screens/posts/PostsListScreen';
import CreatePostScreen from '../screens/posts/CreatePostScreen';
import EditPostScreen from '../screens/posts/EditPostScreen';

// Import types
import type { PostStackParamList } from '../types';

const Stack = createNativeStackNavigator<PostStackParamList>();

export default function PostStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PostsList"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: Colors.text,
        },
        headerTintColor: Colors.primary,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="PostsList"
        component={PostsListScreen}
        options={{
          headerShown: false, // PostsList has its own header
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          title: 'Create Post',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{
          headerShown: false, // EditPost has its own header
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}
