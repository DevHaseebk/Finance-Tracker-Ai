import { startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import type { AnalyticsRangePreset } from '../types';

// Realistic floor for "all time" — no need for genuine open-ended range logic.
const ALL_TIME_START = new Date(2000, 0, 1);

export function getRangeForPreset(
  preset: AnalyticsRangePreset,
  today = new Date()
): { start: Date; end: Date } {
  switch (preset) {
    case 'thisMonth':
      return { start: startOfMonth(today), end: today };
    case 'lastMonth': {
      const lastMonth = subMonths(today, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    case 'last3Months':
      return { start: startOfMonth(subMonths(today, 2)), end: today };
    case 'last6Months':
      return { start: startOfMonth(subMonths(today, 5)), end: today };
    case 'thisYear':
      return { start: startOfYear(today), end: today };
    case 'allTime':
      return { start: ALL_TIME_START, end: today };
  }
}

export const RANGE_PRESET_LABELS: Record<AnalyticsRangePreset, string> = {
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  last3Months: 'Last 3 Months',
  last6Months: 'Last 6 Months',
  thisYear: 'This Year',
  allTime: 'All Time',
};

export const RANGE_PRESETS: AnalyticsRangePreset[] = [
  'thisMonth',
  'lastMonth',
  'last3Months',
  'last6Months',
  'thisYear',
  'allTime',
];
