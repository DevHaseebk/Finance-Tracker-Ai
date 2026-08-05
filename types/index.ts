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
  icon?: string;
  color?: string;
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
  TransactionDetail: { id: string };
};

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Insights: undefined;
  Settings: undefined;
};
