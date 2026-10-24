import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { it, expect } from '@jest/globals';
import { AppProvider } from '../../state/AppProvider';
import { NativeThemeProvider } from '../../theme/ThemeProvider';
import { createReadyData, createTestStorage } from '../../test/memoryStorage';
import { InsightsScreen } from './InsightsScreen';

it('showsSelectedActivityDetails', async () => {
  const data = createReadyData();
  data.checkIns.push({ dateKey: '2026-10-23', mood: 'steady', energy: 4 });
  data.habits.push({ id: 'walk', title: 'Walk', completedDates: ['2026-10-23'] });
  data.journalEntries.push({ id: 'entry', dateKey: '2026-10-23', createdAt: '2026-10-23T12:00:00.000Z', body: 'Good moment' });
  await render(<AppProvider storage={createTestStorage(data)}><NativeThemeProvider><InsightsScreen today={new Date(2026, 9, 24, 12)} /></NativeThemeProvider></AppProvider>);
  expect(screen.getByText('This week: 1 check-in · 1 habit practice')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Activity October 23'));
  expect(screen.getByText(/Friday, October 23, 2026/)).toBeTruthy();
  expect(screen.getByText(/steady mood, energy 4 of 5, 1 habit practice, 1 journal reflection/)).toBeTruthy();
});
