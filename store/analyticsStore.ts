import { create } from 'zustand';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { getRangeForPreset } from '../lib/analyticsRange';
import type {
  AnalyticsRangePreset,
  CategoryBreakdownItem,
  MonthlyTrendPoint,
  SavingsTrendPoint,
  TransactionType,
} from '../types';

const TREND_MONTHS = 6;

interface BreakdownRow {
  category_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  total: number;
}

interface TrendRow {
  month: string;
  income: number;
  expense: number;
}

interface SavingsRow {
  month: string;
  balance: number;
}

function toBreakdownItems(rows: BreakdownRow[]): CategoryBreakdownItem[] {
  const total = rows.reduce((sum, r) => sum + Number(r.total), 0);
  return rows.map((r) => ({
    categoryId: r.category_id,
    name: r.name,
    icon: r.icon ?? undefined,
    color: r.color ?? undefined,
    amount: Number(r.total),
    percent: total > 0 ? (Number(r.total) / total) * 100 : 0,
  }));
}

interface AnalyticsState {
  rangePreset: AnalyticsRangePreset;
  /** Which breakdown the donut + legend display; the Top Spending list always
   * shows expenseBreakdown regardless of this. */
  breakdownType: TransactionType;
  expenseBreakdown: CategoryBreakdownItem[];
  incomeBreakdown: CategoryBreakdownItem[];
  monthlyTrend: MonthlyTrendPoint[];
  savingsTrend: SavingsTrendPoint[];
  isLoadingBreakdown: boolean;
  isLoadingTrends: boolean;
  error: string | null;

  setRangePreset: (preset: AnalyticsRangePreset) => void;
  setBreakdownType: (type: TransactionType) => void;
  fetchBreakdown: () => Promise<void>;
  fetchTrends: () => Promise<void>;
}

// The range-driven breakdown and the fixed-window trend charts are all
// computed in SQL (get_category_breakdown / get_monthly_trend /
// get_savings_trend) — the client never sums raw transaction rows itself.
export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  rangePreset: 'thisMonth',
  breakdownType: 'expense',
  expenseBreakdown: [],
  incomeBreakdown: [],
  monthlyTrend: [],
  savingsTrend: [],
  isLoadingBreakdown: false,
  isLoadingTrends: false,
  error: null,

  setRangePreset: (preset) => {
    set({ rangePreset: preset });
    get().fetchBreakdown();
  },

  // Both breakdowns are already loaded, so switching the donut's income/
  // expense toggle is instant — no refetch needed.
  setBreakdownType: (type) => set({ breakdownType: type }),

  fetchBreakdown: async () => {
    set({ isLoadingBreakdown: true, error: null });
    const { start, end } = getRangeForPreset(get().rangePreset);
    const p_start = format(start, 'yyyy-MM-dd');
    const p_end = format(end, 'yyyy-MM-dd');

    const [expenseResult, incomeResult] = await Promise.all([
      supabase.rpc('get_category_breakdown', { p_start, p_end, p_type: 'expense' }),
      supabase.rpc('get_category_breakdown', { p_start, p_end, p_type: 'income' }),
    ]);

    if (expenseResult.error || incomeResult.error) {
      set({
        isLoadingBreakdown: false,
        error: (expenseResult.error ?? incomeResult.error)?.message ?? 'Failed to load breakdown.',
      });
      return;
    }

    set({
      expenseBreakdown: toBreakdownItems((expenseResult.data ?? []) as BreakdownRow[]),
      incomeBreakdown: toBreakdownItems((incomeResult.data ?? []) as BreakdownRow[]),
      isLoadingBreakdown: false,
    });
  },

  fetchTrends: async () => {
    set({ isLoadingTrends: true, error: null });

    const [trendResult, savingsResult] = await Promise.all([
      supabase.rpc('get_monthly_trend', { p_months: TREND_MONTHS }),
      supabase.rpc('get_savings_trend', { p_months: TREND_MONTHS }),
    ]);

    if (trendResult.error || savingsResult.error) {
      set({
        isLoadingTrends: false,
        error: (trendResult.error ?? savingsResult.error)?.message ?? 'Failed to load trends.',
      });
      return;
    }

    const trendRows = (trendResult.data ?? []) as TrendRow[];
    const savingsRows = (savingsResult.data ?? []) as SavingsRow[];

    set({
      monthlyTrend: trendRows.map((r) => ({
        month: r.month,
        income: Number(r.income),
        expense: Number(r.expense),
      })),
      savingsTrend: savingsRows.map((r) => ({
        month: r.month,
        balance: Number(r.balance),
      })),
      isLoadingTrends: false,
    });
  },
}));
