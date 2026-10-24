import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../state/AppProvider';

export function AppRouteGate({
  segments,
  children,
}: {
  segments: readonly string[];
  children: ReactNode;
}) {
  const { status, data } = useAppStore();
  if (status === 'loading') {
    return (
      <View style={styles.loading} accessibilityLabel="Loading MINDSPRING">
        <Text accessibilityLiveRegion="polite" style={styles.loadingText}>Loading your space…</Text>
      </View>
    );
  }

  const isWelcomeRoute = segments[0] === 'welcome';
  if (!data.profile && !isWelcomeRoute) return <Redirect href="/welcome" />;
  if (data.profile && isWelcomeRoute) return <Redirect href="/(tabs)" />;
  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF7F8',
    padding: 28,
  },
  loadingText: {
    color: '#49273F',
    fontSize: 18,
    fontWeight: '600',
  },
});
