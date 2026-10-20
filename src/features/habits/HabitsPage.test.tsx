import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptyAppData, getLocalDateKey } from '../../app/model';
import { AppProvider } from '../../app/store';
import { STORAGE_KEY } from '../../app/storage';
import { HabitsPage } from './HabitsPage';

function renderHabits() {
  const data = { ...createEmptyAppData(), profile: { displayName: 'Maya', intention: 'Feel steady' } };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return render(
    <MemoryRouter>
      <AppProvider><HabitsPage /></AppProvider>
    </MemoryRouter>,
  );
}

describe('Habits page', () => {
  beforeEach(() => localStorage.clear());

  it('adds a trimmed habit and records completion for today', async () => {
    const user = userEvent.setup();
    renderHabits();

    expect(screen.getByText('No habits yet. Begin with one small action.')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'New habit' }), '  Drink water  ');
    await user.click(screen.getByRole('button', { name: 'Add habit' }));

    const completion = screen.getByRole('checkbox', { name: 'Drink water done today' });
    expect(completion).not.toBeChecked();
    await user.click(completion);
    expect(screen.getByRole('checkbox', { name: 'Drink water done today' })).toBeChecked();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(saved.habits).toHaveLength(1);
    expect(saved.habits[0]).toMatchObject({ title: 'Drink water', completedDates: [getLocalDateKey()] });
  });

  it('rejects a whitespace-only habit title', async () => {
    const user = userEvent.setup();
    renderHabits();

    await user.type(screen.getByRole('textbox', { name: 'New habit' }), '   ');
    await user.click(screen.getByRole('button', { name: 'Add habit' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Give your habit a name first.');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').habits).toEqual([]);
  });
});
