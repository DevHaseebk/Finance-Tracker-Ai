import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import type { TransactionWithCategory } from '../types';

const PAGE_SIZE = 30;

interface SearchRow {
  id: string;
  user_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: number;
  note: string | null;
  date: string;
  created_at: string;
  recurring_id: string | null;
  category_name: string;
  category_icon: string | null;
  category_color: string | null;
}

function mapRow(row: SearchRow): TransactionWithCategory {
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
    categoryName: row.category_name,
    categoryIcon: row.category_icon ?? undefined,
    categoryColor: row.category_color ?? undefined,
  };
}

export interface HistoryFilters {
  year: number | null;
  /** 1-12 */
  month: number | null;
  categoryId: string | null;
  search: string;
}

const DEFAULT_FILTERS: HistoryFilters = {
  year: null,
  month: null,
  categoryId: null,
  search: '',
};

interface HistoryState {
  transactions: TransactionWithCategory[];
  filters: HistoryFilters;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;

  /** Merges into the current filters and refetches from page one. */
  setFilters: (patch: Partial<HistoryFilters>) => void;
  /** Resets to the first page with the current filters — call on mount and
   * whenever the screen refocuses. */
  fetchFirstPage: () => Promise<void>;
  /** Appends the next page; no-ops while already loading or once exhausted. */
  fetchNextPage: () => Promise<void>;
}

// Every fetch — first page or next page, with or without filters — goes
// through search_transactions(), which does the filtering, sorting and
// LIMIT/OFFSET pagination in SQL. The client never holds more than the pages
// that have actually been scrolled into view.
//
// requestId guards against races: typing in the search box or flipping a
// filter can fire a fetch before the previous one resolves. Only the response
// matching the most recently issued request is applied; anything older is
// dropped so a slow, stale response can't clobber newer results.
let requestId = 0;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  transactions: [],
  filters: DEFAULT_FILTERS,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,

  setFilters: (patch) => {
    set((state) => ({ filters: { ...state.filters, ...patch } }));
    get().fetchFirstPage();
  },

  fetchFirstPage: async () => {
    const myRequestId = ++requestId;
    set({ isLoading: true, error: null });

    const { filters } = get();
    const { data, error } = await supabase.rpc('search_transactions', {
      p_year: filters.year,
      p_month: filters.month,
      p_category_id: filters.categoryId,
      p_search: filters.search.trim() || null,
      p_limit: PAGE_SIZE,
      p_offset: 0,
    });

    if (myRequestId !== requestId) return;

    if (error) {
      set({ isLoading: false, error: error.message });
      Toast.show({ type: 'error', text1: "Couldn't load transactions", text2: error.message });
      return;
    }

    const rows = (data ?? []) as SearchRow[];
    set({
      transactions: rows.map(mapRow),
      isLoading: false,
      hasMore: rows.length === PAGE_SIZE,
    });
  },

  fetchNextPage: async () => {
    const { transactions, isLoadingMore, hasMore, isLoading, filters } = get();
    if (isLoadingMore || isLoading || !hasMore) return;

    const myRequestId = ++requestId;
    set({ isLoadingMore: true });

    const { data, error } = await supabase.rpc('search_transactions', {
      p_year: filters.year,
      p_month: filters.month,
      p_category_id: filters.categoryId,
      p_search: filters.search.trim() || null,
      p_limit: PAGE_SIZE,
      p_offset: transactions.length,
    });

    if (myRequestId !== requestId) return;

    if (error) {
      set({ isLoadingMore: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: "Couldn't load more transactions",
        text2: error.message,
      });
      return;
    }

    const rows = (data ?? []) as SearchRow[];
    set((state) => ({
      transactions: [...state.transactions, ...rows.map(mapRow)],
      isLoadingMore: false,
      hasMore: rows.length === PAGE_SIZE,
    }));
  },
}));
