import { describe, expect, it } from '@jest/globals';
import { createEmptyAppData } from '@mindspring/core';
import {
  APP_DATA_KEY,
  THEME_STORAGE_KEY,
  clearAppData,
  clearTheme,
  loadAppData,
  loadTheme,
  saveAppData,
  saveTheme,
  type NativeKeyValueStorage,
} from './nativeStorage';

function makeStorage(seed: Record<string, string> = {}): NativeKeyValueStorage & { values: Map<string, string> } {
  const values = new Map(Object.entries(seed));
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => { values.set(key, value); },
    removeItem: async (key) => { values.delete(key); },
  };
}

describe('native local storage', () => {
  it('loadsEmptyData', async () => {
    const result = await loadAppData(makeStorage());
    expect(result).toEqual({ data: createEmptyAppData(), notice: null, available: true });
  });

  it('recoversFromMalformedJson', async () => {
    const result = await loadAppData(makeStorage({ [APP_DATA_KEY]: '{not json' }));
    expect(result.data).toEqual(createEmptyAppData());
    expect(result.notice).toMatch(/could not be read/i);
    expect(result.available).toBe(true);
  });

  it('roundTripsAppData', async () => {
    const storage = makeStorage();
    const data = createEmptyAppData();
    data.profile = { displayName: 'Maya', intention: 'Feel more present' };
    data.goals.push({ id: 'goal-1', title: 'Rest', completed: false });
    await expect(saveAppData(data, storage)).resolves.toBe(true);
    await expect(loadAppData(storage)).resolves.toMatchObject({ data, notice: null, available: true });
  });

  it('showsNoticeOnStorageFailure', async () => {
    const storage = makeStorage();
    storage.getItem = async () => { throw new Error('offline'); };
    const result = await loadAppData(storage);
    expect(result.data).toEqual(createEmptyAppData());
    expect(result.notice).toMatch(/storage is unavailable/i);
    expect(result.available).toBe(false);
  });

  it('persistsAndClearsTheme', async () => {
    const storage = makeStorage();
    await expect(saveTheme('coastal', storage)).resolves.toBe(true);
    await expect(loadTheme(storage)).resolves.toMatchObject({ theme: 'coastal', available: true });
    await expect(clearTheme(storage)).resolves.toBe(true);
    await expect(clearAppData(storage)).resolves.toBe(true);
    expect(storage.values.has(THEME_STORAGE_KEY)).toBe(false);
  });
});
