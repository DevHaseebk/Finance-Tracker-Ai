export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  note?: string;
  date: string; // yyyy-MM-dd, matches the Postgres `date` column
  createdAt: string;
  /** Set when this transaction was auto-generated from a recurring rule. */
  recurringId?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  isDefault: boolean;
  isHidden: boolean;
}

/** A transaction with its category's display fields already joined in. */
export interface TransactionWithCategory extends Transaction {
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
}

/** Aggregated dashboard totals — computed in SQL via get_dashboard_summary(). */
export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  carriedBefore: number;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringTransaction {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  frequency: RecurringFrequency;
  /** Set only when frequency is 'monthly'; 1-31, clamped at generation time. */
  dayOfMonth?: number;
  /** Set only when frequency is 'weekly'; 0=Sunday..6=Saturday. */
  dayOfWeek?: number;
  startDate: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  isActive: boolean;
  lastGeneratedDate?: string;
  createdAt: string;
}

/** A recurring rule with its category's display fields already joined in. */
export interface RecurringTransactionWithCategory extends RecurringTransaction {
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
}

/** Screens shown while logged out. */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
};

/** Screens shown once a session exists. */
export type RootStackParamList = {
  Tabs: undefined;
  /** Presented modally over the tabs from the floating action button. Omit
   * transactionId to create; pass it to edit an existing transaction.
   * initialType/initialRecurring only apply when creating (ignored once
   * transactionId is set). */
  AddTransaction:
    | { transactionId?: string; initialType?: TransactionType; initialRecurring?: boolean }
    | undefined;
  Categories: undefined;
  /** Omit categoryId to create; pass it to edit an existing custom category. */
  CategoryForm: { categoryId?: string } | undefined;
  RecurringTransactions: undefined;
  /** Editing an existing recurring rule; there is no create route here — new
   * rules are always created via AddTransaction's recurring toggle. */
  RecurringForm: { recurringId: string };
  TransactionDetail: { id: string };
};

export type TabParamList = {
  Dashboard: undefined;
  History: undefined;
  Analytics: undefined;
  Settings: undefined;
};
