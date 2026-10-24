import type { StorageLike } from './storage';
import { isThemeId } from '@mindspring/core';
import type { ThemeId } from '@mindspring/core';

export { getThemeTokens, isThemeId, themes } from '@mindspring/core';
export type { ThemeAppearance, ThemeId, ThemeTokens } from '@mindspring/core';

export const THEME_KEY = 'mindspring:theme';

function browserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readTheme(storage?: StorageLike | null): ThemeId {
  try {
    const value = (storage === undefined ? browserStorage() : storage)?.getItem(THEME_KEY);
    return isThemeId(value) ? value : 'berry';
  } catch {
    return 'berry';
  }
}

export function writeTheme(theme: ThemeId, storage?: StorageLike | null): boolean {
  try {
    const target = storage === undefined ? browserStorage() : storage;
    if (!target) return false;
    target.setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

export function clearTheme(storage?: StorageLike | null): boolean {
  try {
    const target = storage === undefined ? browserStorage() : storage;
    if (!target) return false;
    target.removeItem(THEME_KEY);
    return true;
  } catch {
    return false;
  }
}
