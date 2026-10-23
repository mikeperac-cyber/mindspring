import { createEmptyAppData, type AppData } from './model';

export const STORAGE_KEY = 'mindspring:v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface LoadAppDataResult {
  data: AppData;
  notice: string | null;
  available: boolean;
}

const RECOVERY_NOTICE = 'Saved data could not be read. A fresh space is ready.';
const UNAVAILABLE_NOTICE = 'Your browser storage is unavailable. Changes may not be saved.';

function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isAppData(value: unknown): value is AppData {
  if (!isRecord(value)) return false;
  const { profile, goals, habits, checkIns, journalEntries } = value;
  const validProfile = profile === null || (
    isRecord(profile) && typeof profile.displayName === 'string' && typeof profile.intention === 'string'
  );
  const validGoals = Array.isArray(goals) && goals.every((goal) => (
    isRecord(goal) && typeof goal.id === 'string' && typeof goal.title === 'string' && typeof goal.completed === 'boolean'
  ));
  const validHabits = Array.isArray(habits) && habits.every((habit) => (
    isRecord(habit) && typeof habit.id === 'string' && typeof habit.title === 'string' &&
    Array.isArray(habit.completedDates) && habit.completedDates.every(isDateKey)
  ));
  const validCheckIns = Array.isArray(checkIns) && checkIns.every((checkIn) => (
    isRecord(checkIn) && isDateKey(checkIn.dateKey) &&
    ['low', 'steady', 'bright'].includes(String(checkIn.mood)) &&
    Number.isInteger(checkIn.energy) && Number(checkIn.energy) >= 1 && Number(checkIn.energy) <= 5
  ));
  const validJournalEntries = Array.isArray(journalEntries) && journalEntries.every((entry) => (
    isRecord(entry) && typeof entry.id === 'string' && isDateKey(entry.dateKey) &&
    typeof entry.createdAt === 'string' && typeof entry.body === 'string' &&
    (entry.prompt === undefined || typeof entry.prompt === 'string')
  ));

  return validProfile && validGoals && validHabits && validCheckIns && validJournalEntries;
}

export function loadAppData(storage?: StorageLike | null): LoadAppDataResult {
  const target = storage === undefined ? getBrowserStorage() : storage;
  if (!target) return { data: createEmptyAppData(), notice: UNAVAILABLE_NOTICE, available: false };

  let serialized: string | null;
  try {
    serialized = target.getItem(STORAGE_KEY);
  } catch {
    return { data: createEmptyAppData(), notice: UNAVAILABLE_NOTICE, available: false };
  }

  if (serialized === null) return { data: createEmptyAppData(), notice: null, available: true };

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isAppData(parsed)) return { data: createEmptyAppData(), notice: RECOVERY_NOTICE, available: true };
    return { data: parsed, notice: null, available: true };
  } catch {
    return { data: createEmptyAppData(), notice: RECOVERY_NOTICE, available: true };
  }
}

export function saveAppData(data: AppData, storage?: StorageLike | null): boolean {
  const target = storage === undefined ? getBrowserStorage() : storage;
  if (!target) return false;
  try {
    target.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearAppData(storage?: StorageLike | null): boolean {
  const target = storage === undefined ? getBrowserStorage() : storage;
  if (!target) return false;
  try {
    target.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
