import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createEmptyAppData,
  getLocalDateKey,
  isDateKey,
  type AppData,
  type DailyCheckIn,
  type Profile,
  type ThemeId,
} from '@mindspring/core';
import {
  clearAppData,
  clearTheme,
  loadAppData,
  loadTheme,
  saveAppData,
  saveTheme,
  STORAGE_WRITE_NOTICE,
  type NativeKeyValueStorage,
} from '../storage/nativeStorage';

export interface AppStoreValue {
  data: AppData;
  theme: ThemeId;
  status: 'loading' | 'ready';
  storageAvailable: boolean;
  notice: string | null;
  completeOnboarding(profile: Profile): Promise<boolean>;
  saveCheckIn(input: DailyCheckIn): Promise<boolean>;
  addGoal(title: string): Promise<boolean>;
  toggleGoal(id: string): Promise<void>;
  addHabit(title: string): Promise<boolean>;
  toggleHabitToday(id: string, dateKey: string): Promise<void>;
  addJournalEntry(body: string, prompt?: string): Promise<boolean>;
  updateProfile(profile: Profile): Promise<boolean>;
  setTheme(theme: ThemeId): Promise<void>;
  dismissNotice(): void;
  clearData(): Promise<void>;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

function makeId(prefix: string): string {
  const id = globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  return prefix + '-' + id;
}

function cleanProfile(profile: Profile): Profile | null {
  const displayName = typeof profile.displayName === 'string' ? profile.displayName.trim() : '';
  const intention = typeof profile.intention === 'string' ? profile.intention.trim() : '';
  return displayName && intention ? { displayName, intention } : null;
}

export function AppProvider({
  children,
  storage = AsyncStorage,
}: {
  children: ReactNode;
  storage?: NativeKeyValueStorage;
}) {
  const [data, setData] = useState<AppData>(() => createEmptyAppData());
  const dataRef = useRef(data);
  const [theme, setThemeState] = useState<ThemeId>('berry');
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [notice, setNotice] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const saveQueue = useRef<Promise<boolean>>(Promise.resolve(true));
  const themeQueue = useRef<Promise<boolean>>(Promise.resolve(true));

  useEffect(() => {
    let active = true;
    Promise.all([loadAppData(storage), loadTheme(storage)]).then(([appResult, themeResult]) => {
      if (!active) return;
      dataRef.current = appResult.data;
      setData(appResult.data);
      setThemeState(themeResult.theme);
      setStorageAvailable(appResult.available && themeResult.available);
      setNotice(appResult.notice ?? themeResult.notice);
      setStatus('ready');
    }).catch(() => {
      if (!active) return;
      const freshData = createEmptyAppData();
      dataRef.current = freshData;
      setData(freshData);
      setThemeState('berry');
      setStorageAvailable(false);
      setNotice('Your saved space could not be opened. You can begin again on this iPhone.');
      setStatus('ready');
    });
    return () => { active = false; };
  }, [storage]);

  const commitData = useCallback(async (next: AppData): Promise<boolean> => {
    dataRef.current = next;
    setData(next);
    const pendingSave = saveQueue.current.then(() => saveAppData(next, storage));
    saveQueue.current = pendingSave.catch(() => false);
    const saved = await pendingSave;
    setStorageAvailable(saved);
    setNotice(saved ? null : STORAGE_WRITE_NOTICE);
    return saved;
  }, [storage]);

  const commitTheme = useCallback(async (next: ThemeId): Promise<void> => {
    setThemeState(next);
    const pendingSave = themeQueue.current.then(() => saveTheme(next, storage));
    themeQueue.current = pendingSave.catch(() => false);
    const saved = await pendingSave;
    if (!saved) {
      setStorageAvailable(false);
      setNotice(STORAGE_WRITE_NOTICE);
    } else {
      setNotice(null);
    }
  }, [storage]);

  const completeOnboarding = useCallback(async (profile: Profile): Promise<boolean> => {
    const clean = cleanProfile(profile);
    if (!clean) return false;
    await commitData({ ...dataRef.current, profile: clean });
    return true;
  }, [commitData]);

  const saveCheckIn = useCallback(async (input: DailyCheckIn): Promise<boolean> => {
    if (!isDateKey(input.dateKey)) return false;
    const current = dataRef.current;
    const note = input.note?.trim();
    const savedCheckIn: DailyCheckIn = {
      dateKey: input.dateKey,
      mood: input.mood,
      energy: input.energy,
      ...(note ? { note } : {}),
    };
    const checkIns = current.checkIns
      .filter((checkIn) => checkIn.dateKey !== input.dateKey)
      .concat(savedCheckIn)
      .sort((left, right) => left.dateKey.localeCompare(right.dateKey));
    return commitData({ ...current, checkIns });
  }, [commitData]);

  const addGoal = useCallback(async (title: string): Promise<boolean> => {
    const clean = title.trim();
    if (!clean) return false;
    const current = dataRef.current;
    const saved = await commitData({
      ...current,
      goals: [...current.goals, { id: makeId('goal'), title: clean, completed: false }],
    });
    return saved;
  }, [commitData]);

  const toggleGoal = useCallback(async (id: string): Promise<void> => {
    const current = dataRef.current;
    const goals = current.goals.map((goal) => goal.id === id ? { ...goal, completed: !goal.completed } : goal);
    if (goals.some((goal, index) => goal !== current.goals[index])) await commitData({ ...current, goals });
  }, [commitData]);

  const addHabit = useCallback(async (title: string): Promise<boolean> => {
    const clean = title.trim();
    if (!clean) return false;
    const current = dataRef.current;
    const saved = await commitData({
      ...current,
      habits: [...current.habits, { id: makeId('habit'), title: clean, completedDates: [] }],
    });
    return saved;
  }, [commitData]);

  const toggleHabitToday = useCallback(async (id: string, dateKey: string): Promise<void> => {
    if (!isDateKey(dateKey)) return;
    const current = dataRef.current;
    const habits = current.habits.map((habit) => {
      if (habit.id !== id) return habit;
      const completedDates = habit.completedDates.includes(dateKey)
        ? habit.completedDates.filter((date) => date !== dateKey)
        : [...habit.completedDates, dateKey].sort();
      return { ...habit, completedDates };
    });
    if (habits.some((habit, index) => habit !== current.habits[index])) await commitData({ ...current, habits });
  }, [commitData]);

  const addJournalEntry = useCallback(async (body: string, prompt?: string): Promise<boolean> => {
    const clean = body.trim();
    if (!clean) return false;
    const now = new Date();
    const current = dataRef.current;
    const cleanedPrompt = prompt?.trim();
    const saved = await commitData({
      ...current,
      journalEntries: [{
        id: makeId('entry'),
        dateKey: getLocalDateKey(now),
        createdAt: now.toISOString(),
        body: clean,
        ...(cleanedPrompt ? { prompt: cleanedPrompt } : {}),
      }, ...current.journalEntries],
    });
    return saved;
  }, [commitData]);

  const updateProfile = useCallback(async (profile: Profile): Promise<boolean> => {
    const clean = cleanProfile(profile);
    if (!clean) return false;
    await commitData({ ...dataRef.current, profile: clean });
    return true;
  }, [commitData]);

  const setTheme = useCallback(async (next: ThemeId): Promise<void> => {
    await commitTheme(next);
  }, [commitTheme]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const clearData = useCallback(async (): Promise<void> => {
    await Promise.all([saveQueue.current, themeQueue.current]);
    const [dataCleared, themeCleared] = await Promise.all([clearAppData(storage), clearTheme(storage)]);
    const freshData = createEmptyAppData();
    dataRef.current = freshData;
    setData(freshData);
    setThemeState('berry');
    const cleared = dataCleared && themeCleared;
    setStorageAvailable(cleared);
    setNotice(cleared ? null : 'Your local data could not be cleared from this iPhone.');
  }, [storage]);

  const value = useMemo<AppStoreValue>(() => ({
    data,
    theme,
    status,
    storageAvailable,
    notice,
    completeOnboarding,
    saveCheckIn,
    addGoal,
    toggleGoal,
    addHabit,
    toggleHabitToday,
    addJournalEntry,
    updateProfile,
    setTheme,
    dismissNotice,
    clearData,
  }), [
    data,
    theme,
    status,
    storageAvailable,
    notice,
    completeOnboarding,
    saveCheckIn,
    addGoal,
    toggleGoal,
    addHabit,
    toggleHabitToday,
    addJournalEntry,
    updateProfile,
    setTheme,
    dismissNotice,
    clearData,
  ]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const app = useContext(AppStoreContext);
  if (!app) throw new Error('useAppStore must be used within AppProvider.');
  return app;
}
