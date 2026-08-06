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
   * transactionId to create; pass it to edit an existing transaction. */
  AddTransaction: { transactionId?: string } | undefined;
  Categories: undefined;
  /** Omit categoryId to create; pass it to edit an existing custom category. */
  CategoryForm: { categoryId?: string } | undefined;
  TransactionDetail: { id: string };
};

export type TabParamList = {
  Dashboard: undefined;
  History: undefined;
  Analytics: undefined;
  Settings: undefined;
};
