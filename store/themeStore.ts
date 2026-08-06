import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'cashflow.themeMode';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

interface ThemeState {
  mode: ThemeMode;
  /** True until the persisted choice has been read back on cold start. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  // 'system' by default so a first launch matches whatever the phone is set
  // to rather than forcing light on someone with dark mode enabled.
  mode: 'system',
  isHydrating: true,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (isThemeMode(stored)) {
        set({ mode: stored });
      }
    } catch {
      // A failed read just means we keep the 'system' default — not worth
      // interrupting the user over.
    } finally {
      set({ isHydrating: false });
    }
  },

  setMode: (mode) => {
    // Applied immediately; the write is fire-and-forget so the UI never waits
    // on storage to repaint.
    set({ mode });
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  },
}));
