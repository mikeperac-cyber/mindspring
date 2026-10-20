import { describe, expect, it } from 'vitest';
import { createEmptyAppData, getTodayProgress } from './model';

describe('today momentum calculation', () => {
  it('counts the check-in as the first practice, even when there are no habits', () => {
    const empty = createEmptyAppData();

    expect(getTodayProgress(empty, '2026-10-20')).toEqual({ completed: 0, total: 1, percentage: 0 });
    expect(getTodayProgress({ ...empty, checkIns: [{ dateKey: '2026-10-20', mood: 'steady', energy: 3 }] }, '2026-10-20'))
      .toEqual({ completed: 1, total: 1, percentage: 100 });
  });

  it('counts only check-ins and habit completions for the requested local date', () => {
    const data = {
      ...createEmptyAppData(),
      habits: [
        { id: 'h1', title: 'Drink water', completedDates: ['2026-10-20'] },
        { id: 'h2', title: 'Take a walk', completedDates: ['2026-10-19'] },
      ],
      checkIns: [{ dateKey: '2026-10-20', mood: 'bright' as const, energy: 4 as const }],
    };

    expect(getTodayProgress(data, '2026-10-20')).toEqual({ completed: 2, total: 3, percentage: 67 });
    expect(getTodayProgress(data, '2026-10-21')).toEqual({ completed: 0, total: 3, percentage: 0 });
  });
});
