import React from 'react';
import { Text } from 'react-native';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppRouteGate } from '../navigation/AppRouteGate';
import { AppProvider, useAppStore, type AppStoreValue } from './AppProvider';
import { APP_DATA_KEY, THEME_STORAGE_KEY, type NativeKeyValueStorage } from '../storage/nativeStorage';

jest.mock('expo-router', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Redirect: ({ href }: { href: string }) => ReactModule.createElement(Text, { testID: 'redirect' }, href),
  };
});

function makeStorage(seed: Record<string, string> = {}): NativeKeyValueStorage & { values: Map<string, string> } {
  const values = new Map(Object.entries(seed));
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => { values.set(key, value); },
    removeItem: async (key) => { values.delete(key); },
  };
}

let captured: AppStoreValue | null;

function CaptureStore() {
  captured = useAppStore();
  return (
    <>
      <Text testID="store-status">{captured.status}</Text>
      <AppRouteGate segments={['(tabs)']}>
        <Text>Home content</Text>
      </AppRouteGate>
    </>
  );
}

describe('native app state and onboarding gate', () => {
  beforeEach(() => { captured = null; });

  it('waitsForHydrationBeforeRouting', async () => {
    let releaseAppData: (value: string | null) => void = () => undefined;
    const deferredAppData = new Promise<string | null>((resolve) => { releaseAppData = resolve; });
    const storage = makeStorage();
    storage.getItem = async (key) => key === APP_DATA_KEY ? deferredAppData : null;

    await render(<AppProvider storage={storage}><CaptureStore /></AppProvider>);
    expect(screen.getByText('Loading your space…')).toBeTruthy();
    expect(screen.queryByTestId('redirect')).toBeNull();

    await act(async () => { releaseAppData(null); });
    await waitFor(() => expect(screen.getByTestId('redirect')).toHaveTextContent('/welcome'));
  });

  it('rejectsBlankOnboarding', async () => {
    const storage = makeStorage();
    await render(<AppProvider storage={storage}><CaptureStore /></AppProvider>);
    await waitFor(() => expect(captured?.status).toBe('ready'));

    let result = true;
    await act(async () => {
      result = await captured!.completeOnboarding({ displayName: '  ', intention: 'Build a routine' });
    });
    expect(result).toBe(false);
    expect(captured?.data.profile).toBeNull();
    expect(storage.values.has(APP_DATA_KEY)).toBe(false);
  });

  it('persistsProfileAndThemeAcrossHydration', async () => {
    const storage = makeStorage();
    const first = await render(<AppProvider storage={storage}><CaptureStore /></AppProvider>);
    await waitFor(() => expect(captured?.status).toBe('ready'));
    await act(async () => {
      await captured!.completeOnboarding({ displayName: 'Maya', intention: 'Feel more present' });
      await captured!.setTheme('coastal');
    });
    expect(storage.values.get(THEME_STORAGE_KEY)).toBe('coastal');
    await first.unmount();

    await render(<AppProvider storage={storage}><CaptureStore /></AppProvider>);
    await waitFor(() => expect(captured?.status).toBe('ready'));
    expect(captured?.data.profile).toEqual({ displayName: 'Maya', intention: 'Feel more present' });
    expect(captured?.theme).toBe('coastal');
  });

  it('showsWriteFailureNotice', async () => {
    const storage = makeStorage();
    storage.setItem = async () => { throw new Error('disk full'); };
    await render(<AppProvider storage={storage}><CaptureStore /></AppProvider>);
    await waitFor(() => expect(captured?.status).toBe('ready'));

    await act(async () => {
      await captured!.completeOnboarding({ displayName: 'Maya', intention: 'Feel more present' });
    });
    expect(captured?.storageAvailable).toBe(false);
    expect(captured?.notice).toMatch(/could not be saved/i);
  });
  it('clearsDataAndTheme', async () => {
    const storage = makeStorage({
      [APP_DATA_KEY]: JSON.stringify({
        profile: { displayName: 'Maya', intention: 'Feel more present' },
        goals: [], habits: [], checkIns: [], journalEntries: [],
      }),
      [THEME_STORAGE_KEY]: 'grove',
    });
    await render(<AppProvider storage={storage}><CaptureStore /></AppProvider>);
    await waitFor(() => expect(captured?.status).toBe('ready'));
    await act(async () => { await captured!.clearData(); });

    expect(captured?.data.profile).toBeNull();
    expect(captured?.theme).toBe('berry');
    expect(storage.values.has(APP_DATA_KEY)).toBe(false);
    expect(storage.values.has(THEME_STORAGE_KEY)).toBe(false);
  });
});
