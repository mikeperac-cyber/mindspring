import { describe, expect, it } from 'vitest';
import {
  createEmptyAppData,
  getLocalDateKey,
  getRecentDateKeys,
  getTodayProgress,
  isAppData,
  summarizeLastSevenDays,
  summarizeLastThirtyDays,
  getThemeTokens,
  themes,
} from './index';

describe('shared date and progress contracts', () => {
  it('formatsLocalDateKeys', () => {
    expect(getLocalDateKey(new Date(2026, 9, 24, 23, 59))).toBe('2026-10-24');
  });

  it('buildsRecentDatesAcrossMonthAndYearBoundaries', () => {
    expect(getRecentDateKeys(5, new Date(2026, 0, 2, 8))).toEqual([
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
    ]);
  });

  it('rejectsImpossibleDateKeys', () => {
    const data = createEmptyAppData();
    data.habits.push({ id: 'walk', title: 'Walk', completedDates: ['2026-02-30'] });
    expect(isAppData(data)).toBe(false);
  });

  it('calculatesMomentumFromCheckInAndHabits', () => {
    const data = createEmptyAppData();
    data.checkIns.push({ dateKey: '2026-10-24', mood: 'steady', energy: 3 });
    data.habits.push(
      { id: 'walk', title: 'Walk', completedDates: ['2026-10-24'] },
      { id: 'water', title: 'Drink water', completedDates: [] },
    );
    expect(getTodayProgress(data, '2026-10-24')).toEqual({ completed: 2, total: 3, percentage: 67 });
  });

  it('summarizesSevenAndThirtyDayActivity', () => {
    const data = createEmptyAppData();
    data.checkIns.push(
      { dateKey: '2026-08-27', mood: 'low', energy: 2 },
      { dateKey: '2026-09-01', mood: 'bright', energy: 5 },
    );
    data.habits.push({ id: 'walk', title: 'Walk', completedDates: ['2026-08-30', '2026-09-02'] });
    data.journalEntries.push(
      { id: 'one', dateKey: '2026-08-30', createdAt: '2026-08-30T12:00:00.000Z', body: 'A reflection' },
      { id: 'two', dateKey: '2026-09-02', createdAt: '2026-09-02T12:00:00.000Z', body: 'Another reflection' },
    );
    const today = new Date(2026, 8, 2, 12);

    expect(summarizeLastSevenDays(data, today)).toMatchObject({
      checkInDays: 2,
      habitCompletions: 2,
      moodCounts: { low: 1, steady: 0, bright: 1 },
      averageEnergy: 3.5,
    });
    expect(summarizeLastThirtyDays(data, today)).toHaveLength(30);
    expect(summarizeLastThirtyDays(data, today).at(-1)).toMatchObject({
      dateKey: '2026-09-02',
      habitCompletions: 1,
      reflections: 1,
    });
  });

  it('providesThreeThemesForBothAppearances', () => {
    expect(themes.map(({ id }) => id)).toEqual(['berry', 'coastal', 'grove']);
    for (const theme of themes) {
      const light = getThemeTokens(theme.id, 'light');
      const dark = getThemeTokens(theme.id, 'dark');
      expect(light.background).not.toBe(dark.background);
      expect(new Set([light.goals, light.habits, light.journal, light.insights]).size).toBe(4);
    }
    expect(new Set(themes.map(({ id }) => getThemeTokens(id, 'light').primary)).size).toBe(3);
  });
});
