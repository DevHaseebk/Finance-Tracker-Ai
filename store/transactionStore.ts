import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Transaction, TransactionType } from '../types';

interface TransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // yyyy-MM-dd
}

interface MutationResult {
  error: string | null;
}

interface FetchResult {
  data: Transaction | null;
  error: string | null;
}

interface TransactionRow {
  id: string;
  user_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  date: string;
  created_at: string;
  recurring_id: string | null;
}

function mapRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    type: row.type,
    amount: row.amount,
    note: row.note ?? undefined,
    date: row.date,
    createdAt: row.created_at,
    recurringId: row.recurring_id ?? undefined,
  };
}

const SELECT_COLUMNS =
  'id, user_id, category_id, type, amount, note, date, created_at, recurring_id';

interface TransactionState {
  transactions: Transaction[];
  isMutating: boolean;

  fetchTransactionById: (id: string) => Promise<FetchResult>;
  addTransaction: (input: TransactionInput) => Promise<MutationResult>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<MutationResult>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isMutating: false,

  fetchTransactionById: async (id) => {
    // RLS scopes this to the signed-in user.
    const { data, error } = await supabase
      .from('transactions')
      .select(SELECT_COLUMNS)
      .eq('id', id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: mapRow(data), error: null };
  },

  addTransaction: async (input) => {
    set({ isMutating: true });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userError || !userId) {
      set({ isMutating: false });
      return { error: 'You must be signed in to add a transaction.' };
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: input.categoryId,
        type: input.type,
        amount: input.amount,
        note: input.note.trim() || null,
        date: input.date,
      })
      .select(SELECT_COLUMNS)
      .single();

    set({ isMutating: false });
    if (error) return { error: error.message };

    set((state) => ({ transactions: [mapRow(data), ...state.transactions] }));
    return { error: null };
  },

  updateTransaction: async (id, input) => {
    set({ isMutating: true });

    const { data, error } = await supabase
      .from('transactions')
      .update({
        category_id: input.categoryId,
        type: input.type,
        amount: input.amount,
        note: input.note.trim() || null,
        date: input.date,
      })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    set({ isMutating: false });
    if (error) return { error: error.message };

    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? mapRow(data) : t)),
    }));
    return { error: null };
  },
}));
