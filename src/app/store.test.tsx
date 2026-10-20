import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProvider, useAppStore } from './store';
import { STORAGE_KEY, type StorageLike } from './storage';

function StoreProbe() {
  const app = useAppStore();
  return (
    <>
      <output data-testid="app-data">{JSON.stringify(app.data)}</output>
      <output data-testid="notice">{app.notice ?? ''}</output>
      <output data-testid="storage-status">{app.storageAvailable ? 'available' : 'unavailable'}</output>
      <button onClick={() => app.completeOnboarding({ displayName: ' Maya ', intention: ' Rest more ' })}>Complete onboarding</button>
      <button onClick={() => app.completeOnboarding({ displayName: ' ', intention: ' ' })}>Submit blank profile</button>
      <button onClick={() => app.saveCheckIn({ dateKey: '2026-10-20', mood: 'steady', energy: 3 })}>Save check-in</button>
      <button onClick={() => app.saveCheckIn({ dateKey: '2026-10-20', mood: 'bright', energy: 5 })}>Update check-in</button>
      <button onClick={() => app.addGoal('  Read more  ')}>Add goal</button>
      <button onClick={() => app.addGoal('   ')}>Add blank goal</button>
      <button onClick={() => app.toggleGoal(app.data.goals[0]?.id ?? '')}>Toggle goal</button>
      <button onClick={() => app.addHabit('  Drink water  ')}>Add habit</button>
      <button onClick={() => app.addHabit('  ')}>Add blank habit</button>
      <button onClick={() => app.toggleHabitToday(app.data.habits[0]?.id ?? '', '2026-10-20')}>Toggle habit today</button>
      <button onClick={() => app.addJournalEntry('  A quiet start.  ')}>Add journal entry</button>
      <button onClick={() => app.addJournalEntry('  ')}>Add blank journal entry</button>
      <button onClick={() => app.updateProfile({ displayName: ' Maya B. ', intention: ' Keep resting ' })}>Update profile</button>
      <button onClick={() => app.dismissNotice()}>Dismiss notice</button>
      <button onClick={() => app.clearData()}>Clear data</button>
    </>
  );
}

function renderStore(storage?: StorageLike | null) {
  return render(
    <AppProvider storage={storage}>
      <StoreProbe />
    </AppProvider>,
  );
}

function readData() {
  return JSON.parse(screen.getByTestId('app-data').textContent ?? '{}');
}

describe('Mindspring app store', () => {
  beforeEach(() => localStorage.clear());

  it('trims profile and activity input and persists store actions', async () => {
    renderStore();
    fireEvent.click(screen.getByRole('button', { name: 'Complete onboarding' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save check-in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update check-in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add goal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toggle goal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add habit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toggle habit today' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add journal entry' }));

    const data = readData();
    expect(data.profile).toEqual({ displayName: 'Maya', intention: 'Rest more' });
    expect(data.checkIns).toEqual([{ dateKey: '2026-10-20', mood: 'bright', energy: 5 }]);
    expect(data.goals).toHaveLength(1);
    expect(data.goals[0]).toMatchObject({ title: 'Read more', completed: true });
    expect(data.habits[0]).toMatchObject({ title: 'Drink water', completedDates: ['2026-10-20'] });
    expect(data.journalEntries[0]).toMatchObject({ dateKey: expect.any(String), body: 'A quiet start.' });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual(data);
  });

  it('rejects blank text, updates a profile, and clears local data', () => {
    renderStore();
    fireEvent.click(screen.getByRole('button', { name: 'Submit blank profile' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add blank goal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add blank habit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add blank journal entry' }));
    expect(readData()).toMatchObject({ profile: null, goals: [], habits: [], journalEntries: [] });

    fireEvent.click(screen.getByRole('button', { name: 'Complete onboarding' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update profile' }));
    expect(readData().profile).toEqual({ displayName: 'Maya B.', intention: 'Keep resting' });

    fireEvent.click(screen.getByRole('button', { name: 'Clear data' }));
    expect(readData()).toMatchObject({ profile: null, goals: [], habits: [], checkIns: [], journalEntries: [] });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('surfaces and dismisses a storage warning when browser storage is blocked', async () => {
    const blocked: StorageLike = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    renderStore(blocked);

    expect(screen.getByTestId('storage-status')).toHaveTextContent('unavailable');
    expect(screen.getByTestId('notice')).toHaveTextContent('Your browser storage is unavailable. Changes may not be saved.');
    fireEvent.click(screen.getByRole('button', { name: 'Complete onboarding' }));
    await waitFor(() => expect(screen.getByTestId('notice')).toHaveTextContent('Changes are only saved in this browser session.'));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notice' }));
    expect(screen.getByTestId('notice')).toBeEmptyDOMElement();
  });
});
