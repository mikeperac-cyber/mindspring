import React from 'react';
import { AppState, Text } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { AppProvider } from '../../state/AppProvider';
import { NativeThemeProvider } from '../../theme/ThemeProvider';
import { APP_DATA_KEY } from '../../storage/nativeStorage';
import { createReadyData, createTestStorage } from '../../test/memoryStorage';
import { HomeScreen } from './HomeScreen';
import { useLocalToday } from '../../state/useLocalToday';

const TODAY = new Date(2026, 9, 24, 12);

async function renderHome(data = createReadyData()) {
  const storage = createTestStorage(data);
  const result = await render(
    <AppProvider storage={storage}>
      <NativeThemeProvider>
        <HomeScreen today={TODAY} />
      </NativeThemeProvider>
    </AppProvider>,
  );
  await waitFor(() => expect(screen.getByText('Good morning, Maya')).toBeTruthy());
  return { ...result, storage };
}

describe('Today screen', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('savesCheckInAndReplacesSameDayEntry', async () => {
    const { storage } = await renderHome();
    await fireEvent.press(screen.getByLabelText('Mood: Bright'));
    await fireEvent.press(screen.getByLabelText('Energy 5 of 5'));
    await fireEvent.press(screen.getByLabelText('Save check-in'));
    await waitFor(() => expect(screen.getByText('Your check-in is saved for today.')).toBeTruthy());

    await fireEvent.press(screen.getByLabelText('Mood: Low'));
    await fireEvent.press(screen.getByLabelText('Energy 1 of 5'));
    await fireEvent.press(screen.getByLabelText('Update check-in'));
    await waitFor(() => expect(screen.getByText('Your check-in is saved for today.')).toBeTruthy());

    const saved = JSON.parse(storage.values.get(APP_DATA_KEY) ?? '{}');
    expect(saved.checkIns).toHaveLength(1);
    expect(saved.checkIns[0]).toMatchObject({ dateKey: '2026-10-24', mood: 'low', energy: 1 });
  });

  it('showsCheckInWriteFailure', async () => {
    const storage = createTestStorage(createReadyData());
    storage.setItem = async () => { throw new Error('disk full'); };
    await render(
      <AppProvider storage={storage}>
        <NativeThemeProvider><HomeScreen today={TODAY} /></NativeThemeProvider>
      </AppProvider>,
    );
    await fireEvent.press(screen.getByLabelText('Mood: Steady'));
    await fireEvent.press(screen.getByLabelText('Save check-in'));
    await waitFor(() => expect(screen.getByText('Your check-in could not be saved. Please try again.')).toBeTruthy());
  });
  it('updatesMomentumAfterHabitToggle', async () => {
    const data = createReadyData();
    data.habits.push({ id: 'water', title: 'Drink water', completedDates: [] });
    await renderHome(data);
    expect(screen.getByText('0 of 2 tracker steps · 0%')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Complete Drink water today'));
    await waitFor(() => expect(screen.getByText('1 of 2 tracker steps · 50%')).toBeTruthy());
  });

  it('showsContextualNextAction', async () => {
    const data = createReadyData();
    data.habits.push({ id: 'walk', title: 'Take a short walk', completedDates: [] });
    await renderHome(data);
    expect(screen.getByRole('button', { name: 'Start a check-in' })).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Mood: Steady'));
    await fireEvent.press(screen.getByLabelText('Save check-in'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'See habits' })).toBeTruthy());
  });
});

function DateProbe() {
  return <Text>{useLocalToday()}</Text>;
}

describe('local day refresh', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('refreshesDateOnForeground', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 24, 23, 59));
    let onAppState: ((state: string) => void) | null = null;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      onAppState = listener as (state: string) => void;
      return { remove: jest.fn() };
    });

    await render(<DateProbe />);
    expect(screen.getByText('2026-10-24')).toBeTruthy();

    await act(async () => {
      jest.setSystemTime(new Date(2026, 9, 25, 0, 1));
      onAppState?.('active');
    });
    expect(screen.getByText('2026-10-25')).toBeTruthy();
  });
});





