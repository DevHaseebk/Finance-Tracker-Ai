import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import type { RecurringFrequency, RecurringTransactionWithCategory, TransactionType } from '../types';

interface RecurringInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  frequency: RecurringFrequency;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  startDate: string; // yyyy-MM-dd
  endDate: string | null; // yyyy-MM-dd
}

interface MutationResult {
  error: string | null;
}

interface FetchOneResult {
  data: RecurringTransactionWithCategory | null;
  error: string | null;
}

interface RecurringRow {
  id: string;
  user_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  frequency: RecurringFrequency;
  day_of_month: number | null;
  day_of_week: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  last_generated_date: string | null;
  created_at: string;
  category: { name: string; icon: string | null; color: string | null } | null;
}

function mapRow(row: RecurringRow): RecurringTransactionWithCategory {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    type: row.type,
    amount: row.amount,
    note: row.note ?? undefined,
    frequency: row.frequency,
    dayOfMonth: row.day_of_month ?? undefined,
    dayOfWeek: row.day_of_week ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    isActive: row.is_active,
    lastGeneratedDate: row.last_generated_date ?? undefined,
    createdAt: row.created_at,
    categoryName: row.category?.name ?? 'Uncategorized',
    categoryIcon: row.category?.icon ?? undefined,
    categoryColor: row.category?.color ?? undefined,
  };
}

const SELECT_COLUMNS =
  'id, user_id, category_id, type, amount, note, frequency, day_of_month, day_of_week, start_date, end_date, is_active, last_generated_date, created_at, category:categories(name, icon, color)';

function toInsertPayload(userId: string, input: RecurringInput) {
  return {
    user_id: userId,
    category_id: input.categoryId,
    type: input.type,
    amount: input.amount,
    note: input.note.trim() || null,
    frequency: input.frequency,
    day_of_week: input.dayOfWeek,
    day_of_month: input.dayOfMonth,
    start_date: input.startDate,
    end_date: input.endDate,
  };
}

interface RecurringState {
  rules: RecurringTransactionWithCategory[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchRules: () => Promise<void>;
  fetchRuleById: (id: string) => Promise<FetchOneResult>;
  addRule: (input: RecurringInput) => Promise<MutationResult>;
  updateRule: (id: string, input: RecurringInput) => Promise<MutationResult>;
  deleteRule: (id: string) => Promise<MutationResult>;
  setActive: (id: string, isActive: boolean) => Promise<MutationResult>;
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  rules: [],
  isLoading: false,
  isMutating: false,
  error: null,

  fetchRules: async () => {
    set({ isLoading: true, error: null });

    // RLS scopes this to the signed-in user.
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(SELECT_COLUMNS)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false })
      .returns<RecurringRow[]>();

    if (error) {
      set({ isLoading: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: "Couldn't load recurring transactions",
        text2: error.message,
      });
      return;
    }
    set({ rules: (data ?? []).map(mapRow), isLoading: false });
  },

  fetchRuleById: async (id) => {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(SELECT_COLUMNS)
      .eq('id', id)
      .single<RecurringRow>();

    if (error) return { data: null, error: error.message };
    return { data: mapRow(data), error: null };
  },

  addRule: async (input) => {
    set({ isMutating: true });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userError || !userId) {
      set({ isMutating: false });
      return { error: 'You must be signed in to add a recurring transaction.' };
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert(toInsertPayload(userId, input))
      .select('id')
      .single();

    set({ isMutating: false });
    if (error) return { error: error.message };

    // Backfills any occurrences already due (a past or today's start_date) so
    // they show up immediately. This has to be awaited, not fire-and-forget —
    // the caller navigates back right after this resolves and Dashboard/
    // History refetch on focus, so an un-awaited call would frequently lose
    // that race and the new transaction wouldn't appear until the next pull-
    // to-refresh. A failure here isn't surfaced as a save error — the rule
    // itself was created fine, and tomorrow's cron will catch up regardless.
    await supabase.rpc('generate_recurring_backfill_for_rule', { p_recurring_id: data.id });

    return { error: null };
  },

  updateRule: async (id, input) => {
    set({ isMutating: true });

    const { data, error } = await supabase
      .from('recurring_transactions')
      .update({
        category_id: input.categoryId,
        type: input.type,
        amount: input.amount,
        note: input.note.trim() || null,
        frequency: input.frequency,
        day_of_week: input.dayOfWeek,
        day_of_month: input.dayOfMonth,
        start_date: input.startDate,
        end_date: input.endDate,
      })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single<RecurringRow>();

    set({ isMutating: false });
    if (error) return { error: error.message };

    set((state) => ({
      rules: state.rules.map((r) => (r.id === id ? mapRow(data) : r)),
    }));

    // Same awaited backfill as addRule, same reason — covers editing a rule
    // that was created then immediately edited before ever generating.
    await supabase.rpc('generate_recurring_backfill_for_rule', { p_recurring_id: id });

    return { error: null };
  },

  deleteRule: async (id) => {
    set({ isMutating: true });

    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);

    set({ isMutating: false });
    if (error) return { error: error.message };

    set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
    return { error: null };
  },

  setActive: async (id, isActive) => {
    const previous = get().rules;
    // Optimistic update: pausing/resuming should feel instant.
    set({ rules: previous.map((r) => (r.id === id ? { ...r, isActive } : r)) });

    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      set({ rules: previous });
      return { error: error.message };
    }
    return { error: null };
  },
}));
