import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { expect, it, jest } from '@jest/globals';
import { AppProvider } from '../../state/AppProvider';
import { NativeThemeProvider } from '../../theme/ThemeProvider';
import { APP_DATA_KEY, THEME_STORAGE_KEY } from '../../storage/nativeStorage';
import { createReadyData, createTestStorage } from '../../test/memoryStorage';
import { ProfileScreen } from './ProfileScreen';

it('persistsThemeAndProfile', async () => {
  const storage = createTestStorage(createReadyData());
  await render(<AppProvider storage={storage}><NativeThemeProvider><ProfileScreen /></NativeThemeProvider></AppProvider>);
  await fireEvent.changeText(screen.getByLabelText('Display name'), 'Maya R.');
  await fireEvent.changeText(screen.getByLabelText('My intention'), 'Make space to rest');
  await fireEvent.press(screen.getByLabelText('Save profile'));
  await fireEvent.press(screen.getByLabelText('Theme: Coastal'));
  await waitFor(() => {
    const saved = JSON.parse(storage.values.get(APP_DATA_KEY) ?? '{}');
    expect(saved.profile).toEqual({ displayName: 'Maya R.', intention: 'Make space to rest' });
    expect(storage.values.get(THEME_STORAGE_KEY)).toBe('coastal');
  });
  expect(screen.getByText(/Appearance follows your iPhone settings/)).toBeTruthy();
  expect(screen.getByLabelText('Theme: Coastal').props.accessibilityState.selected).toBe(true);
});

it('requiresConfirmationBeforeClear', async () => {
  const storage = createTestStorage(createReadyData(), 'grove');
  const navigate = jest.fn();
  await render(<AppProvider storage={storage}><NativeThemeProvider><ProfileScreen onNavigate={navigate} /></NativeThemeProvider></AppProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Clear local data' }));
  expect(screen.getByText('Clear this iPhone’s MINDSPRING data?')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
  expect(storage.values.has(APP_DATA_KEY)).toBe(true);
  expect(storage.values.get(THEME_STORAGE_KEY)).toBe('grove');

  await fireEvent.press(screen.getByRole('button', { name: 'Clear local data' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Delete everything' }));
  await waitFor(() => expect(storage.values.has(APP_DATA_KEY)).toBe(false));
  expect(storage.values.has(THEME_STORAGE_KEY)).toBe(false);
  expect(navigate).toHaveBeenCalledWith('/welcome');
});
