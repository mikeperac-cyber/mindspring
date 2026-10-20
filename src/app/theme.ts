import type { StorageLike } from './storage';

export const THEME_KEY = 'mindspring:theme';

export const themes = [
  { id: 'berry', name: 'Berry', description: 'Warm plum and rose' },
  { id: 'coastal', name: 'Coastal', description: 'Cool sea and sky' },
  { id: 'grove', name: 'Grove', description: 'Soft green and earth' },
] as const;

export type ThemeId = (typeof themes)[number]['id'];

export function isThemeId(value: unknown): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

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
