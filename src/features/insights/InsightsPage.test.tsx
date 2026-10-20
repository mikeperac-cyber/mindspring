import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { createEmptyAppData } from '../../app/model';
import { AppProvider } from '../../app/store';
import { STORAGE_KEY } from '../../app/storage';
import { InsightsPage, summarizeLastSevenDays } from './InsightsPage';

describe('seven-day progress summary', () => {
  const today = new Date(2026, 9, 20, 12);
  const data = {
    ...createEmptyAppData(),
    profile: { displayName: 'Maya', intention: 'Feel steady' },
    checkIns: [
      { dateKey: '2026-10-20', mood: 'bright' as const, energy: 4 as const },
      { dateKey: '2026-10-18', mood: 'steady' as const, energy: 3 as const },
      { dateKey: '2026-10-12', mood: 'low' as const, energy: 1 as const },
    ],
    habits: [
      { id: 'h1', title: 'Drink water', completedDates: ['2026-10-20', '2026-10-19', '2026-10-12'] },
      { id: 'h2', title: 'Take a walk', completedDates: ['2026-10-18'] },
    ],
  };

  it('summarizes only local dates in the latest seven-day window', () => {
    expect(summarizeLastSevenDays(data, today)).toMatchObject({
      checkInDays: 2,
      habitCompletions: 3,
      days: [
        { dateKey: '2026-10-14', checkIn: false, habitCompletions: 0 },
        { dateKey: '2026-10-15', checkIn: false, habitCompletions: 0 },
        { dateKey: '2026-10-16', checkIn: false, habitCompletions: 0 },
        { dateKey: '2026-10-17', checkIn: false, habitCompletions: 0 },
        { dateKey: '2026-10-18', checkIn: true, habitCompletions: 1 },
        { dateKey: '2026-10-19', checkIn: false, habitCompletions: 1 },
        { dateKey: '2026-10-20', checkIn: true, habitCompletions: 1 },
      ],
    });
  });

  it('provides a readable text summary beside the progress visualization', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    render(<MemoryRouter><AppProvider><InsightsPage today={today} /></AppProvider></MemoryRouter>);
    expect(screen.getByText('2 check-ins in the last 7 days')).toBeInTheDocument();
    expect(screen.getByText('3 habit completions in the last 7 days')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Daily check-ins across the last 7 days' })).toBeInTheDocument();
  });
});
