import React from 'react';
import { View, Text } from 'react-native';

export default function LoginScreenMinimal() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Login Screen Test</Text>
      <Text style={{ marginTop: 20 }}>If you see this, the basic screen works!</Text>
    </View>
  );
}
