import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { friendlyAuthError } from '../lib/validation';

interface AuthResult {
  error: string | null;
  /** True when signup succeeded but the account still needs email confirmation. */
  needsEmailConfirmation?: boolean;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  /** True until the persisted session has been restored on cold start. */
  isInitializing: boolean;
  /** True while a login/signup/logout request is in flight. */
  isSubmitting: boolean;

  initialize: () => () => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitializing: true,
  isSubmitting: false,

  // Restores any persisted session, then subscribes to auth changes.
  // Returns an unsubscribe function for the caller to run on unmount.
  initialize: () => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        set({
          session: data.session,
          user: data.session?.user ?? null,
          isInitializing: false,
        });
      })
      .catch(() => {
        set({ isInitializing: false });
        Toast.show({
          type: 'error',
          text1: "Couldn't restore your session",
          text2: 'Please sign in again.',
        });
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isInitializing: false,
      });
    });

    return () => subscription.unsubscribe();
  },

  login: async (email, password) => {
    set({ isSubmitting: true });
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    set({ isSubmitting: false });

    // onAuthStateChange sets session/user on success, so nothing to do here.
    return { error: error ? friendlyAuthError(error.message) : null };
  },

  signup: async (email, password) => {
    set({ isSubmitting: true });
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    set({ isSubmitting: false });

    if (error) {
      return { error: friendlyAuthError(error.message) };
    }

    // With email confirmation enabled, Supabase returns a user but no session.
    const needsEmailConfirmation = !data.session && !!data.user;
    return { error: null, needsEmailConfirmation };
  },

  logout: async () => {
    set({ isSubmitting: true });
    const { error } = await supabase.auth.signOut();
    set({ isSubmitting: false });

    if (error) {
      return { error: friendlyAuthError(error.message) };
    }

    set({ session: null, user: null });
    return { error: null };
  },
}));
