import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingApp } from './src/OnboardingApp';
import { colors } from './src/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <OnboardingApp />
    </SafeAreaProvider>
  );
}

export default App;
