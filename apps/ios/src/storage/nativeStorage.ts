import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createEmptyAppData,
  isAppData,
  isThemeId,
  type AppData,
  type ThemeId,
} from '@mindspring/core';

export const APP_DATA_KEY = 'mindspring:v1';
export const THEME_STORAGE_KEY = 'mindspring:theme';

export interface NativeKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface NativeLoadResult {
  data: AppData;
  notice: string | null;
  available: boolean;
}

const RECOVERY_NOTICE = 'Saved data could not be read. A fresh space is ready.';
const UNAVAILABLE_NOTICE = 'Your iPhone storage is unavailable. Changes may not be saved.';
const SAVE_NOTICE = 'Your changes are visible now but could not be saved on this iPhone.';

export async function loadAppData(storage: NativeKeyValueStorage = AsyncStorage): Promise<NativeLoadResult> {
  let serialized: string | null;
  try {
    serialized = await storage.getItem(APP_DATA_KEY);
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

export async function saveAppData(data: AppData, storage: NativeKeyValueStorage = AsyncStorage): Promise<boolean> {
  try {
    await storage.setItem(APP_DATA_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export async function clearAppData(storage: NativeKeyValueStorage = AsyncStorage): Promise<boolean> {
  try {
    await storage.removeItem(APP_DATA_KEY);
    return true;
  } catch {
    return false;
  }
}

export async function loadTheme(storage: NativeKeyValueStorage = AsyncStorage): Promise<{
  theme: ThemeId;
  notice: string | null;
  available: boolean;
}> {
  try {
    const stored = await storage.getItem(THEME_STORAGE_KEY);
    if (stored === null) return { theme: 'berry', notice: null, available: true };
    if (isThemeId(stored)) return { theme: stored, notice: null, available: true };
    return { theme: 'berry', notice: 'Your saved theme was not recognized. Berry is shown.', available: true };
  } catch {
    return { theme: 'berry', notice: UNAVAILABLE_NOTICE, available: false };
  }
}

export async function saveTheme(theme: ThemeId, storage: NativeKeyValueStorage = AsyncStorage): Promise<boolean> {
  if (!isThemeId(theme)) return false;
  try {
    await storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

export async function clearTheme(storage: NativeKeyValueStorage = AsyncStorage): Promise<boolean> {
  try {
    await storage.removeItem(THEME_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export const STORAGE_WRITE_NOTICE = SAVE_NOTICE;
