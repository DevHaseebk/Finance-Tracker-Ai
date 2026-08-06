import { format } from 'date-fns';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return format(value, pattern);
}

/** Signed amount string, e.g. "+$12.50" / "−$8.00", colored by sign/type. */
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
