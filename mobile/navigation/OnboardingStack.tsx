/**
 * Onboarding Navigation Stack
 * Handles navigation between the 6 onboarding screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding1Screen from '../screens/onboarding/Onboarding1Screen';
import Onboarding2Screen from '../screens/onboarding/Onboarding2Screen';
import Onboarding3Screen from '../screens/onboarding/Onboarding3Screen';
import Onboarding4Screen from '../screens/onboarding/Onboarding4Screen';
import Onboarding5Screen from '../screens/onboarding/Onboarding5Screen';
import Onboarding6Screen from '../screens/onboarding/Onboarding6Screen';

export type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Onboarding4: undefined;
  Onboarding5: undefined;
  Onboarding6: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
      <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
      <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />
      <Stack.Screen name="Onboarding4" component={Onboarding4Screen} />
      <Stack.Screen name="Onboarding5" component={Onboarding5Screen} />
      <Stack.Screen name="Onboarding6" component={Onboarding6Screen} />
    </Stack.Navigator>
  );
}
