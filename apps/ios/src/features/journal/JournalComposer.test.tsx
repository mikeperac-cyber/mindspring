import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { AppProvider } from '../../state/AppProvider';
import { NativeThemeProvider } from '../../theme/ThemeProvider';
import { APP_DATA_KEY } from '../../storage/nativeStorage';
import { createReadyData, createTestStorage } from '../../test/memoryStorage';
import { AddSheet } from '../../components/AddSheet';
import { JournalComposer } from './JournalComposer';

const navigation = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };

async function renderComposer() {
  const storage = createTestStorage(createReadyData());
  const result = await render(
    <AppProvider storage={storage}>
      <NativeThemeProvider>
        <JournalComposer onBack={navigation.back} />
      </NativeThemeProvider>
    </AppProvider>,
  );
  return { ...result, storage };
}

describe('journal composer and Add flow', () => {
  it('opensJournalComposerFromAddSheet', async () => {
    const storage = createTestStorage(createReadyData());
    const navigate = jest.fn();
    await render(
      <AppProvider storage={storage}>
        <NativeThemeProvider>
          <AddSheet onNavigate={navigate} />
        </NativeThemeProvider>
      </AppProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Journal reflection' }));
    expect(navigate).toHaveBeenCalledWith('/journal/compose');
  });

  it('createsJournalEntryAndRejectsBlankText', async () => {
    const { storage } = await renderComposer();
    await fireEvent.press(screen.getByLabelText('Save reflection'));
    expect(screen.getByText('Write a few words before saving.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Reflection entry'), 'I noticed that slowing down helped.');
    await fireEvent.press(screen.getByLabelText('Save reflection'));
    await waitFor(() => {
      const saved = JSON.parse(storage.values.get(APP_DATA_KEY) ?? '{}');
      expect(saved.journalEntries).toHaveLength(1);
      expect(saved.journalEntries[0].body).toBe('I noticed that slowing down helped.');
    });
  });

  it('validates and creates a habit', async () => {
    const storage = createTestStorage(createReadyData());
    await render(
      <AppProvider storage={storage}>
        <NativeThemeProvider><AddSheet /></NativeThemeProvider>
      </AppProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Add a habit' }));
    await fireEvent.press(screen.getByLabelText('Save habit'));
    expect(screen.getByText('Enter a name for this habit.')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Habit name'), ' Drink water ');
    await fireEvent.press(screen.getByLabelText('Save habit'));
    await waitFor(() => {
      const saved = JSON.parse(storage.values.get(APP_DATA_KEY) ?? '{}');
      expect(saved.habits).toHaveLength(1);
      expect(saved.habits[0].title).toBe('Drink water');
    });
    expect(screen.getByText('Your habit is ready for today.')).toBeTruthy();
  });
  it('reports a habit write failure', async () => {
    const storage = createTestStorage(createReadyData());
    storage.setItem = async () => { throw new Error('disk full'); };
    await render(
      <AppProvider storage={storage}>
        <NativeThemeProvider><AddSheet /></NativeThemeProvider>
      </AppProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Add a habit' }));
    await fireEvent.changeText(screen.getByLabelText('Habit name'), 'Drink water');
    await fireEvent.press(screen.getByLabelText('Save habit'));
    await waitFor(() => expect(screen.getByText('This could not be saved. Please try again.')).toBeTruthy());
  });
  it('preservesAddDraftWhenDismissed', async () => {
    const storage = createTestStorage(createReadyData());
    const first = await render(
      <AppProvider storage={storage}>
        <NativeThemeProvider><AddSheet /></NativeThemeProvider>
      </AppProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Add a habit' }));
    await fireEvent.changeText(screen.getByLabelText('Habit name'), 'Walk after lunch');
    await first.unmount();

    await render(
      <AppProvider storage={storage}>
        <NativeThemeProvider><AddSheet /></NativeThemeProvider>
      </AppProvider>,
    );
    expect(screen.getByDisplayValue('Walk after lunch')).toBeTruthy();
  });
});



