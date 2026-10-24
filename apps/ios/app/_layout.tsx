import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AppRouteGate } from '../src/navigation/AppRouteGate';
import { AppProvider } from '../src/state/AppProvider';
import { NativeThemeProvider } from '../src/theme/ThemeProvider';
import { StorageNotice } from '../src/components/StorageNotice';

function AppNavigator() {
  const segments = useSegments();
  return (
    <AppRouteGate segments={segments}>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <StorageNotice />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="habits" options={{ headerShown: false }} />
          <Stack.Screen name="add" options={{ presentation: 'formSheet', headerShown: false, sheetGrabberVisible: true }} />
          <Stack.Screen name="journal/compose" options={{ headerShown: false }} />
          <Stack.Screen name="journal/entry/[id]" options={{ headerShown: false }} />
        </Stack>
      </View>
    </AppRouteGate>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <NativeThemeProvider>
        <AppNavigator />
      </NativeThemeProvider>
    </AppProvider>
  );
}
