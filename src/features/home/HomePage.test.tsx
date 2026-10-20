import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptyAppData, getLocalDateKey } from '../../app/model';
import { AppProvider } from '../../app/store';
import { STORAGE_KEY } from '../../app/storage';
import { HomePage } from './HomePage';

function seedProfileAndHabit() {
  const data = {
    ...createEmptyAppData(),
    profile: { displayName: 'Maya', intention: 'Make room for rest' },
    habits: [{ id: 'habit-water', title: 'Drink water', completedDates: [] }],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderHome() {
  return render(
    <MemoryRouter>
      <AppProvider><HomePage /></AppProvider>
    </MemoryRouter>,
  );
}

describe('Home dashboard', () => {
  beforeEach(() => localStorage.clear());

  it('saves and updates one check-in per local day and updates momentum', async () => {
    const user = userEvent.setup();
    seedProfileAndHabit();
    renderHome();

    expect(screen.getByRole('heading', { name: 'Good morning, Maya.' })).toBeInTheDocument();
    expect(screen.getByText('0 of 2 practices complete')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Steady' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Energy level' }), { target: { value: '3' } });
    await user.click(screen.getByRole('button', { name: /Save today.s check-in/ }));
    expect(screen.getByText('Check-in saved. Thanks for checking in.')).toHaveAttribute('role', 'status');
    expect(screen.getByText('1 of 2 practices complete')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Bright' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Energy level' }), { target: { value: '5' } });
    await user.click(screen.getByRole('button', { name: /Save today.s check-in/ }));

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(saved.checkIns).toEqual([{ dateKey: getLocalDateKey(), mood: 'bright', energy: 5 }]);
    expect(saved.habits).toEqual([{ id: 'habit-water', title: 'Drink water', completedDates: [] }]);
  });

  it('shows an actionable empty state when the person has no habits', () => {
    const data = { ...createEmptyAppData(), profile: { displayName: 'Maya', intention: 'Rest' } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    renderHome();

    expect(screen.getByText('No habits yet. Start with one small thing.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add a habit' })).toHaveAttribute('href', '/app/habits');
  });
});
