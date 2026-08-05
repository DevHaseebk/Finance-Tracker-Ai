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

export type RootStackParamList = {
  Welcome: undefined;
  Tabs: undefined;
  TransactionDetail: { id: string };
};

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Insights: undefined;
  Settings: undefined;
};
