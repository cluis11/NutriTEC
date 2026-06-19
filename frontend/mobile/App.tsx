import React from 'react';
import { SafeAreaView } from 'react-native';
import LoginScreen from './src/screens/Login';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoginScreen />
    </SafeAreaView>
  );
}