import { describe, expect, it } from 'vitest';
import { createEmptyAppData, getLocalDateKey, type AppData } from './model';
import { clearAppData, loadAppData, saveAppData, STORAGE_KEY, type StorageLike } from './storage';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

describe('MINDSPRING browser storage', () => {
  it('starts with an empty profile when there is no saved data', () => {
    expect(loadAppData(createMemoryStorage())).toEqual({
      data: createEmptyAppData(),
      notice: null,
      available: true,
    });
  });

  it('recovers from malformed saved JSON and reports the recovery', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: '{not json' });

    expect(loadAppData(storage)).toEqual({
      data: createEmptyAppData(),
      notice: 'Saved data could not be read. A fresh space is ready.',
      available: true,
    });
  });

  it('recovers when saved JSON has an invalid app-data shape', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ profile: 'wrong-shape' }) });

    expect(loadAppData(storage)).toEqual({
      data: createEmptyAppData(),
      notice: 'Saved data could not be read. A fresh space is ready.',
      available: true,
    });
  });

  it('round-trips a profile and activity through the versioned storage key', () => {
    const storage = createMemoryStorage();
    const data: AppData = {
      profile: { displayName: 'Maya', intention: 'Make room to rest' },
      goals: [{ id: 'goal-1', title: 'Read more', completed: false }],
      habits: [{ id: 'habit-1', title: 'Drink water', completedDates: ['2026-10-20'] }],
      checkIns: [{ dateKey: '2026-10-20', mood: 'steady', energy: 3 }],
      journalEntries: [{ id: 'entry-1', dateKey: '2026-10-20', createdAt: '2026-10-20T09:00:00.000Z', body: 'A quiet start.' }],
    };

    expect(saveAppData(data, storage)).toBe(true);
    expect(loadAppData(storage)).toEqual({ data, notice: null, available: true });
  });

  it('returns a local date key without shifting to UTC', () => {
    const localDate = new Date(2026, 9, 20, 23, 45);

    expect(getLocalDateKey(localDate)).toBe('2026-10-20');
  });

  it('reports unavailable storage and failed writes without throwing', () => {
    const blockedStorage: StorageLike = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };

    expect(loadAppData(blockedStorage)).toEqual({
      data: createEmptyAppData(),
      notice: 'Your browser storage is unavailable. Changes may not be saved.',
      available: false,
    });
    expect(saveAppData(createEmptyAppData(), blockedStorage)).toBe(false);
    expect(clearAppData(blockedStorage)).toBe(false);
  });

  it('clears the versioned key', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify(createEmptyAppData()) });

    expect(clearAppData(storage)).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});
