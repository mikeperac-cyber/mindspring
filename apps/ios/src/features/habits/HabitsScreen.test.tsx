import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { describe, expect, it } from '@jest/globals';
import { AppProvider } from '../../state/AppProvider';
import { NativeThemeProvider } from '../../theme/ThemeProvider';
import { APP_DATA_KEY } from '../../storage/nativeStorage';
import { createReadyData, createTestStorage } from '../../test/memoryStorage';
import { HabitsScreen } from './HabitsScreen';

const TODAY = new Date(2026, 9, 24, 12);

it('togglesHabitForLocalToday', async () => {
  const data = createReadyData();
  data.habits.push({ id: 'walk', title: 'Take a short walk', completedDates: [] });
  const storage = createTestStorage(data);
  await render(
    <AppProvider storage={storage}>
      <NativeThemeProvider>
        <HabitsScreen today={TODAY} />
      </NativeThemeProvider>
    </AppProvider>,
  );
  await waitFor(() => expect(screen.getByText('Take a short walk')).toBeTruthy());

  await fireEvent.press(screen.getByLabelText('Complete Take a short walk today'));
  await waitFor(() => {
    const saved = JSON.parse(storage.values.get(APP_DATA_KEY) ?? '{}');
    expect(saved.habits[0].completedDates).toEqual(['2026-10-24']);
  });
});

