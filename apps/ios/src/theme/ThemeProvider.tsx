import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getThemeTokens, type ThemeAppearance, type ThemeTokens } from '@mindspring/core';
import { useAppStore } from '../state/AppProvider';

export interface NativeThemeValue {
  theme: ReturnType<typeof useAppStore>['theme'];
  appearance: ThemeAppearance;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<NativeThemeValue | null>(null);

export function NativeThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useAppStore();
  const systemScheme = useColorScheme();
  const appearance: ThemeAppearance = systemScheme === 'dark' ? 'dark' : 'light';
  const value = useMemo<NativeThemeValue>(
    () => ({ theme, appearance, tokens: getThemeTokens(theme, appearance) }),
    [theme, appearance],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useNativeTheme(): NativeThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useNativeTheme must be used within NativeThemeProvider.');
  return value;
}
