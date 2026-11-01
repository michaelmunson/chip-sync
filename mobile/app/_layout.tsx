import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/providers/AuthProvider';
import { initializeRuntime } from '../src/platform/runtime';
import { RuntimeContext } from '../src/providers/RuntimeContext';
import { Card, Label, useColors } from '../src/components/primitives';

export default function RootLayout() {
  const colors = useColors();
  const [initialization] = useState(() => {
    try { return { runtime: initializeRuntime(), error: '' }; }
    catch (error) { return { runtime: null, error: error instanceof Error ? error.message : 'Configuration failed.' }; }
  });
  return <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {initialization.runtime ? <RuntimeContext.Provider value={initialization.runtime}>
        <AuthProvider><Stack screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.ink }}>
          <Stack.Screen name="index" options={{ title: 'Chip Sync' }} />
        </Stack></AuthProvider>
      </RuntimeContext.Provider> : <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
        <Card><Label error>{initialization.error}</Label></Card>
      </SafeAreaView>}
    </SafeAreaProvider>
  </GestureHandlerRootView>;
}
