import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { DashboardSummary, TransactionWithCategory } from '../types';

const RECENT_LIMIT = 8;

interface SummaryRow {
  total_income: number;
  total_expense: number;
  balance: number;
  carried_before: number;
  month_income: number;
  month_expense: number;
  month_net: number;
}

function mapSummary(row: SummaryRow): DashboardSummary {
  return {
    totalIncome: Number(row.total_income),
    totalExpense: Number(row.total_expense),
    balance: Number(row.balance),
    carriedBefore: Number(row.carried_before),
    monthIncome: Number(row.month_income),
    monthExpense: Number(row.month_expense),
    monthNet: Number(row.month_net),
  };
}

interface RecentTransactionRow {
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

function mapRecent(row: RecentTransactionRow): TransactionWithCategory {
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

interface DashboardState {
  summary: DashboardSummary | null;
  recentTransactions: TransactionWithCategory[];
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  recentTransactions: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });

    // Two aggregated/bounded queries, run in parallel — never the full table:
    // - get_dashboard_summary() computes every sum in SQL.
    // - the transactions query is capped with .limit() and only pulls the
    //   columns the Recent Transactions list needs, with the category joined
    //   in the same round trip instead of a separate lookup per row.
    const [summaryResult, recentResult] = await Promise.all([
      supabase.rpc('get_dashboard_summary').single<SummaryRow>(),
      supabase
        .from('transactions')
        .select(
          'id, user_id, category_id, type, amount, note, date, created_at, recurring_id, category:categories(name, icon, color)'
        )
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(RECENT_LIMIT)
        .returns<RecentTransactionRow[]>(),
    ]);

    if (summaryResult.error || recentResult.error) {
      set({
        isLoading: false,
        error: (summaryResult.error ?? recentResult.error)?.message ?? 'Failed to load dashboard.',
      });
      return;
    }

    set({
      summary: summaryResult.data ? mapSummary(summaryResult.data) : null,
      recentTransactions: (recentResult.data ?? []).map(mapRecent),
      isLoading: false,
    });
  },
}));
