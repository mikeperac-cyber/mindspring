import { createEmptyAppData, type AppData, type ThemeId } from '@mindspring/core';
import { APP_DATA_KEY, THEME_STORAGE_KEY, type NativeKeyValueStorage } from '../storage/nativeStorage';

export class MemoryStorage implements NativeKeyValueStorage {
  readonly values: Map<string, string>;

  constructor(seed: Record<string, string> = {}) {
    this.values = new Map(Object.entries(seed));
  }

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.values.delete(key);
  }
}

export function createReadyData(): AppData {
  return { ...createEmptyAppData(), profile: { displayName: 'Maya', intention: 'Feel more present' } };
}

export function createTestStorage(data: AppData, theme: ThemeId = 'berry'): MemoryStorage {
  return new MemoryStorage({
    [APP_DATA_KEY]: JSON.stringify(data),
    [THEME_STORAGE_KEY]: theme,
  });
}
