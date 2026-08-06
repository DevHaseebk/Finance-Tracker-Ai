import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './theme';
import { useThemeStore } from '../store/themeStore';

export interface Theme {
  colors: ThemeColors;
  /** The scheme actually being rendered, after resolving 'system'. */
  scheme: 'light' | 'dark';
  isDark: boolean;
}

/** Resolves the user's stored preference against the OS setting. */
export function useTheme(): Theme {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();

  return useMemo(() => {
    // useColorScheme() is nullable on first paint and on platforms that don't
    // report one, so anything that isn't explicitly 'dark' falls back to light.
    const scheme: 'light' | 'dark' =
      mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    return {
      colors: scheme === 'dark' ? darkColors : lightColors,
      scheme,
      isDark: scheme === 'dark',
    };
  }, [mode, systemScheme]);
}

/**
 * Builds a StyleSheet from the active palette, rebuilding it only when the
 * palette actually changes.
 *
 * `factory` must be defined at module scope — a function literal declared
 * inside the component would be a new reference on every render and defeat
 * the memo:
 *
 *   const makeStyles = (c: ThemeColors) => StyleSheet.create({ ... })
 *   // inside the component:
 *   const styles = useThemedStyles(makeStyles)
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
