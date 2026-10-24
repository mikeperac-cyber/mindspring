import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { AppProvider } from '../../state/AppProvider';
import { NativeThemeProvider } from '../../theme/ThemeProvider';
import { APP_DATA_KEY } from '../../storage/nativeStorage';
import { createReadyData, createTestStorage } from '../../test/memoryStorage';
import { JournalScreen } from './JournalScreen';
import { JournalComposer } from './JournalComposer';

it('listsSavedReflectionsNewestFirst', async () => {
  const data = createReadyData();
  data.journalEntries = [
    { id: 'older', dateKey: '2026-10-20', createdAt: '2026-10-20T12:00:00.000Z', body: 'An older thought' },
    { id: 'newer', dateKey: '2026-10-24', createdAt: '2026-10-24T12:00:00.000Z', body: 'A newer thought' },
  ];
  const storage = createTestStorage(data);
  const navigate = jest.fn();
  await render(<AppProvider storage={storage}><NativeThemeProvider><JournalScreen onNavigate={navigate} /></NativeThemeProvider></AppProvider>);
  const rows = screen.getAllByRole('button', { name: /Journal reflection:/ });
  expect(rows[0].props.accessibilityLabel).toBe('Journal reflection: A newer thought');
  await fireEvent.press(rows[0]);
  expect(navigate).toHaveBeenCalledWith('/journal/entry/newer');
});

it('keepsSaveAvailableForLongJournalDrafts', async () => {
  const storage = createTestStorage(createReadyData());
  await render(<AppProvider storage={storage}><NativeThemeProvider><JournalComposer /></NativeThemeProvider></AppProvider>);
  const longEntry = 'A thought I want to remember. '.repeat(150);
  await fireEvent.changeText(screen.getByLabelText('Reflection entry'), longEntry);
  expect(screen.getByLabelText('Save reflection')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Save reflection'));
  await waitFor(() => {
    const saved = JSON.parse(storage.values.get(APP_DATA_KEY) ?? '{}');
    expect(saved.journalEntries[0].body).toBe(longEntry.trim());
  });
});

it('preservesJournalDraftAfterReturningFromComposer', async () => {
  const storage = createTestStorage(createReadyData());
  const first = await render(<AppProvider storage={storage}><NativeThemeProvider><JournalComposer /></NativeThemeProvider></AppProvider>);
  await fireEvent.changeText(screen.getByLabelText('Reflection entry'), 'I want to come back to this thought.');
  await first.unmount();
  await render(<AppProvider storage={storage}><NativeThemeProvider><JournalComposer /></NativeThemeProvider></AppProvider>);
  expect(screen.getByDisplayValue('I want to come back to this thought.')).toBeTruthy();
});
