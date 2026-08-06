export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
  date: string; // ISO string
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
  /** Presented modally over the tabs from the floating action button. */
  AddTransaction: undefined;
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
