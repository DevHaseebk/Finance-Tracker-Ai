import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';

interface MutationResult {
  error: string | null;
}

interface SettingsState {
  startingBalance: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateStartingBalance: (value: number) => Promise<MutationResult>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  startingBalance: 0,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });

    // maybeSingle, not single — a brand-new user has no row yet, and that's
    // not an error condition, just "starting balance is 0".
    const { data, error } = await supabase
      .from('user_settings')
      .select('starting_balance')
      .maybeSingle();

    if (error) {
      set({ isLoading: false, error: error.message });
      Toast.show({ type: 'error', text1: "Couldn't load settings", text2: error.message });
      return;
    }
    set({ startingBalance: data ? Number(data.starting_balance) : 0, isLoading: false });
  },

  updateStartingBalance: async (value) => {
    set({ isMutating: true });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userError || !userId) {
      set({ isMutating: false });
      return { error: 'You must be signed in to update this.' };
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, starting_balance: value }, { onConflict: 'user_id' });

    set({ isMutating: false });
    if (error) return { error: error.message };

    set({ startingBalance: value });
    return { error: null };
  },
}));
