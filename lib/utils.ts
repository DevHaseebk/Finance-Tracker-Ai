import { format, isToday, isYesterday } from 'date-fns';
import type { TransactionWithCategory } from '../types';

/** Displayed before every amount in the app. */
export const CURRENCY_SYMBOL = 'Rs';

export function formatCurrency(amount: number): string {
  // Formatted manually rather than with `style: 'currency'` — Intl renders PKR
  // as "PKR 1,234.00" and its locale data isn't guaranteed on Hermes, so the
  // grouping is taken from en-US (identical to how PKR is written) and the
  // symbol is prefixed here.
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return `${amount < 0 ? '-' : ''}${CURRENCY_SYMBOL} ${formatted}`;
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return format(value, pattern);
}

/** Signed amount string, e.g. "+Rs 12.50" / "−Rs 8.00", colored by sign/type. */
export function signedAmount(value: number, type: 'income' | 'expense' | 'auto' = 'auto'): string {
  const isIncome = type === 'auto' ? value >= 0 : type === 'income';
  const sign = isIncome ? '+' : '−';
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function ordinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = n % 100;
  return `${n}${suffixes[(remainder - 20) % 10] ?? suffixes[remainder] ?? suffixes[0]}`;
}

export interface TransactionDateSection {
  /** yyyy-MM-dd — stable key, distinct from the display title. */
  key: string;
  title: string;
  data: TransactionWithCategory[];
}

/**
 * Groups an already-sorted (newest first) transaction list into per-date
 * sections for a SectionList with sticky headers. Re-run over the whole
 * accumulated list on every page load, not per-page, so a date split across
 * two fetched pages still merges into one section instead of duplicating it.
 */
export function groupTransactionsByDate(
  transactions: TransactionWithCategory[]
): TransactionDateSection[] {
  const sections: TransactionDateSection[] = [];
  let current: TransactionDateSection | null = null;

  for (const transaction of transactions) {
    if (!current || current.key !== transaction.date) {
      current = { key: transaction.date, title: formatSectionTitle(transaction.date), data: [] };
      sections.push(current);
    }
    current.data.push(transaction);
  }

  return sections;
}

function formatSectionTitle(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMM d, yyyy');
}

/** Human-readable summary of a recurring rule's cadence, e.g. "Weekly on Tuesday". */
export function describeRecurringSchedule(rule: {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
}): string {
  if (rule.frequency === 'daily') return 'Daily';
  if (rule.frequency === 'weekly') {
    return `Weekly on ${WEEKDAY_NAMES[rule.dayOfWeek ?? 0]}`;
  }
  return `Monthly on the ${ordinal(rule.dayOfMonth ?? 1)}`;
}
