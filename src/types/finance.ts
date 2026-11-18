export type TransactionType = 'income' | 'expense';

export type ViewMode =
  | 'overview'
  | 'ledger'
  | 'recurring'
  | 'categories'
  | 'comparison';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number; // positive value in BRL
  category: string;
  date: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  recurring: boolean;
  notes?: string;
  createdAt: number;
}

export interface RecurringItem {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  dayOfMonth: number; // 1..31
  active: boolean;
  createdAt: number;
}

export interface CategoryDefinition {
  id: string;
  label: string;
  type: TransactionType;
  color: string; // hex color strictly for chart bars
}

export interface MonthlyAggregate {
  monthKey: string;
  label: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  commitmentRate: number; // 0-100+
  transactionCount: number;
}

export interface CategorySummary {
  categoryId: string;
  label: string;
  color: string;
  total: number;
  count: number;
  shareOfExpense: number;
  shareOfIncome: number;
}
