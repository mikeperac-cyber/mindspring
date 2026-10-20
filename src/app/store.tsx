import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createEmptyAppData, getLocalDateKey, type AppData, type DailyCheckIn, type Profile } from './model';
import { clearAppData, loadAppData, saveAppData, type StorageLike } from './storage';
import { clearTheme, readTheme, writeTheme, type ThemeId } from './theme';

export interface AppStoreValue {
  data: AppData;
  notice: string | null;
  storageAvailable: boolean;
  theme: ThemeId;
  setTheme(theme: ThemeId): void;
  completeOnboarding(profile: Profile): boolean;
  saveCheckIn(input: DailyCheckIn): void;
  addGoal(title: string): boolean;
  toggleGoal(id: string): void;
  addHabit(title: string): boolean;
  toggleHabitToday(id: string, dateKey: string): void;
  addJournalEntry(body: string): boolean;
  updateProfile(profile: Profile): boolean;
  dismissNotice(): void;
  clearData(): void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

function makeId(prefix: string): string {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

function cleanProfile(profile: Profile): Profile | null {
  const displayName = profile.displayName.trim();
  const intention = profile.intention.trim();
  return displayName && intention ? { displayName, intention } : null;
}

export function AppProvider({ children, storage }: { children: ReactNode; storage?: StorageLike | null }) {
  const [initial] = useState(() => loadAppData(storage));
  const [data, setData] = useState(initial.data);
  const dataRef = useRef(initial.data);
  const [notice, setNotice] = useState(initial.notice);
  const [storageAvailable, setStorageAvailable] = useState(initial.available);
  const [theme, setThemeState] = useState<ThemeId>(() => readTheme(storage));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    themeColor?.setAttribute('content', {
      berry: '#FBF7F8',
      coastal: '#F4FAFB',
      grove: '#F7F8F2',
    }[theme]);
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    if (!writeTheme(next, storage)) {
      setStorageAvailable(false);
      setNotice('Your theme is active for this session but could not be saved.');
    }
  }, [storage]);

  const commitData = useCallback((next: AppData) => {
    dataRef.current = next;
    setData(next);
    const saved = saveAppData(next, storage);
    setStorageAvailable(saved);
    setNotice(saved ? null : 'Changes are only saved in this browser session.');
  }, [storage]);

  const completeOnboarding = useCallback((profile: Profile) => {
    const clean = cleanProfile(profile);
    if (!clean) return false;
    commitData({ ...dataRef.current, profile: clean });
    return true;
  }, [commitData]);

  const saveCheckIn = useCallback((input: DailyCheckIn) => {
    const current = dataRef.current;
    const checkIns = current.checkIns.filter((checkIn) => checkIn.dateKey !== input.dateKey);
    commitData({ ...current, checkIns: [...checkIns, input].sort((a, b) => a.dateKey.localeCompare(b.dateKey)) });
  }, [commitData]);

  const addGoal = useCallback((title: string) => {
    const clean = title.trim();
    if (!clean) return false;
    const current = dataRef.current;
    commitData({ ...current, goals: [...current.goals, { id: makeId('goal'), title: clean, completed: false }] });
    return true;
  }, [commitData]);

  const toggleGoal = useCallback((id: string) => {
    const current = dataRef.current;
    const goals = current.goals.map((goal) => goal.id === id ? { ...goal, completed: !goal.completed } : goal);
    if (goals.some((goal, index) => goal !== current.goals[index])) commitData({ ...current, goals });
  }, [commitData]);

  const addHabit = useCallback((title: string) => {
    const clean = title.trim();
    if (!clean) return false;
    const current = dataRef.current;
    commitData({ ...current, habits: [...current.habits, { id: makeId('habit'), title: clean, completedDates: [] }] });
    return true;
  }, [commitData]);

  const toggleHabitToday = useCallback((id: string, dateKey: string) => {
    const current = dataRef.current;
    const habits = current.habits.map((habit) => {
      if (habit.id !== id) return habit;
      const completedDates = habit.completedDates.includes(dateKey)
        ? habit.completedDates.filter((date) => date !== dateKey)
        : [...habit.completedDates, dateKey].sort();
      return { ...habit, completedDates };
    });
    if (habits.some((habit, index) => habit !== current.habits[index])) commitData({ ...current, habits });
  }, [commitData]);

  const addJournalEntry = useCallback((body: string) => {
    const clean = body.trim();
    if (!clean) return false;
    const now = new Date();
    const current = dataRef.current;
    commitData({
      ...current,
      journalEntries: [{ id: makeId('entry'), dateKey: getLocalDateKey(now), createdAt: now.toISOString(), body: clean }, ...current.journalEntries],
    });
    return true;
  }, [commitData]);

  const updateProfile = useCallback((profile: Profile) => {
    const clean = cleanProfile(profile);
    if (!clean) return false;
    commitData({ ...dataRef.current, profile: clean });
    return true;
  }, [commitData]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const clearData = useCallback(() => {
    dataRef.current = createEmptyAppData();
    setData(dataRef.current);
    const cleared = clearAppData(storage);
    const themeCleared = clearTheme(storage);
    setThemeState('berry');
    setStorageAvailable(cleared && themeCleared);
    setNotice(cleared && themeCleared ? null : 'Your local data could not be cleared.');
  }, [storage]);

  const value = useMemo<AppStoreValue>(() => ({
    data,
    notice,
    storageAvailable,
    theme,
    setTheme,
    completeOnboarding,
    saveCheckIn,
    addGoal,
    toggleGoal,
    addHabit,
    toggleHabitToday,
    addJournalEntry,
    updateProfile,
    dismissNotice,
    clearData,
  }), [data, notice, storageAvailable, theme, setTheme, completeOnboarding, saveCheckIn, addGoal, toggleGoal, addHabit, toggleHabitToday, addJournalEntry, updateProfile, dismissNotice, clearData]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const app = useContext(AppStoreContext);
  if (!app) throw new Error('useAppStore must be used within AppProvider.');
  return app;
}
