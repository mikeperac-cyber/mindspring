import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { it, expect } from '@jest/globals';
import { AppProvider } from '../../state/AppProvider';
import { NativeThemeProvider } from '../../theme/ThemeProvider';
import { APP_DATA_KEY } from '../../storage/nativeStorage';
import { createReadyData, createTestStorage } from '../../test/memoryStorage';
import { GoalsScreen } from './GoalsScreen';

it('createsAndCompletesGoal', async () => {
  const storage = createTestStorage(createReadyData());
  await render(<AppProvider storage={storage}><NativeThemeProvider><GoalsScreen /></NativeThemeProvider></AppProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Create a goal' }));
  await fireEvent.changeText(screen.getByLabelText('Goal name'), 'Read for 10 minutes');
  await fireEvent.press(screen.getByLabelText('Save goal'));
  await waitFor(() => {
    const saved = JSON.parse(storage.values.get(APP_DATA_KEY) ?? '{}');
    expect(saved.goals).toHaveLength(1);
    expect(saved.goals[0]).toMatchObject({ title: 'Read for 10 minutes', completed: false });
  });
  await fireEvent.press(screen.getByLabelText('Complete Read for 10 minutes'));
  await waitFor(() => {
    const saved = JSON.parse(storage.values.get(APP_DATA_KEY) ?? '{}');
    expect(saved.goals[0].completed).toBe(true);
  });
});
