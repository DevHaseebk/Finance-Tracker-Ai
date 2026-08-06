import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { TransactionWithCategory } from '../types';

const PAGE_SIZE = 30;

interface HistoryRow {
  id: string;
  user_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: number;
  note: string | null;
  date: string;
  created_at: string;
  recurring_id: string | null;
  category: { name: string; icon: string | null; color: string | null } | null;
}

function mapRow(row: HistoryRow): TransactionWithCategory {
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
    categoryName: row.category?.name ?? 'Uncategorized',
    categoryIcon: row.category?.icon ?? undefined,
    categoryColor: row.category?.color ?? undefined,
  };
}

const SELECT_COLUMNS =
  'id, user_id, category_id, type, amount, note, date, created_at, recurring_id, category:categories(name, icon, color)';

interface HistoryState {
  transactions: TransactionWithCategory[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;

  /** Resets to the first page — call on mount and whenever the screen refocuses. */
  fetchFirstPage: () => Promise<void>;
  /** Appends the next page; no-ops while already loading or once exhausted. */
  fetchNextPage: () => Promise<void>;
}

// A page-at-a-time list, never the full table: each request is capped at
// PAGE_SIZE rows via .range(), so history can grow indefinitely without the
// client ever holding more than what's been scrolled into view.
export const useHistoryStore = create<HistoryState>((set, get) => ({
  transactions: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,

  fetchFirstPage: async () => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('transactions')
      .select(SELECT_COLUMNS)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1)
      .returns<HistoryRow[]>();

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({
      transactions: (data ?? []).map(mapRow),
      isLoading: false,
      hasMore: (data?.length ?? 0) === PAGE_SIZE,
    });
  },

  fetchNextPage: async () => {
    const { transactions, isLoadingMore, hasMore, isLoading } = get();
    if (isLoadingMore || isLoading || !hasMore) return;

    set({ isLoadingMore: true });

    const from = transactions.length;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('transactions')
      .select(SELECT_COLUMNS)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)
      .returns<HistoryRow[]>();

    if (error) {
      set({ isLoadingMore: false, error: error.message });
      return;
    }

    set((state) => ({
      transactions: [...state.transactions, ...(data ?? []).map(mapRow)],
      isLoadingMore: false,
      hasMore: (data?.length ?? 0) === PAGE_SIZE,
    }));
  },
}));
