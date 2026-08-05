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
