import { createEmptyAppData, isAppData, type AppData } from '@mindspring/core';

export { isAppData } from '@mindspring/core';

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
