import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CategorySummary,
  MonthlyAggregate,
  RecurringItem,
  Transaction,
  TransactionType,
} from '../types/finance';
import {
  buildDemoRecurringItems,
  buildDemoTransactions,
  EXPENSE_CATEGORIES,
  getCategoryById,
} from '../constants/categories';
import {
  formatMonthLabel,
  getCurrentMonthKey,
  shiftMonthKey,
} from '../utils/formatters';

const STORAGE_KEY = 'saldoclaro_v1_transactions';
const RECURRING_STORAGE_KEY = 'saldoclaro_v1_recurring';
const DEMO_FLAG_KEY = 'saldoclaro_v1_is_demo';

function loadInitialTransactions(): { items: Transaction[]; isDemo: boolean } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const demoFlag = localStorage.getItem(DEMO_FLAG_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return {
          items: parsed,
          isDemo: demoFlag === 'true',
        };
      }
    }
  } catch {
    // Fallback cleanly to demo data if storage is unavailable or corrupted
  }
  const demo = buildDemoTransactions();
  return { items: demo, isDemo: true };
}

function loadInitialRecurring(isDemo: boolean): RecurringItem[] {
  try {
    const saved = localStorage.getItem(RECURRING_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage error
  }
  return isDemo ? buildDemoRecurringItems() : [];
}

function clampDayToMonth(monthKey: string, dayOfMonth: number): string {
  const [yStr, mStr] = monthKey.split('-');
  const year = Number.parseInt(yStr, 10);
  const monthIndex = Number.parseInt(mStr, 10) - 1;
  const maxDay = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(Math.max(dayOfMonth, 1), maxDay);
  return `${monthKey}-${String(safeDay).padStart(2, '0')}`;
}

export interface NewTransactionInput {
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string;
  recurring: boolean;
  notes?: string;
}

export interface NewRecurringInput {
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  active: boolean;
}

export function useFinanceStore() {
  const initial = useMemo(() => loadInitialTransactions(), []);
  const initialRecurring = useMemo(
    () => loadInitialRecurring(initial.isDemo),
    [initial.isDemo]
  );
  const [transactions, setTransactions] = useState<Transaction[]>(initial.items);
  const [recurringItems, setRecurringItems] =
    useState<RecurringItem[]>(initialRecurring);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(initial.isDemo);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthKey());
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      localStorage.setItem(
        RECURRING_STORAGE_KEY,
        JSON.stringify(recurringItems)
      );
      localStorage.setItem(DEMO_FLAG_KEY, String(isDemoMode));
    } catch {
      // Ignore storage quota errors safely
    }
  }, [transactions, recurringItems, isDemoMode]);

  const addTransaction = useCallback((input: NewTransactionInput) => {
    const monthKey = input.date.slice(0, 7);
    const cleanDesc = input.description.trim();
    const roundedAmount = Math.round(input.amount * 100) / 100;
    const created: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: input.type,
      description: cleanDesc,
      amount: roundedAmount,
      category: input.category,
      date: input.date,
      monthKey,
      recurring: input.recurring,
      notes: input.notes?.trim() || undefined,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [created, ...prev]);

    if (input.recurring) {
      const parsedDay = Number.parseInt(input.date.slice(8, 10), 10);
      const dayOfMonth =
        Number.isFinite(parsedDay) && parsedDay >= 1 && parsedDay <= 31
          ? parsedDay
          : 10;
      setRecurringItems((prev) => {
        const exists = prev.some(
          (r) =>
            r.type === input.type &&
            r.description.trim().toLowerCase() === cleanDesc.toLowerCase()
        );
        if (exists) return prev;
        return [
          {
            id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: input.type,
            description: cleanDesc,
            amount: roundedAmount,
            category: input.category,
            dayOfMonth,
            active: true,
            createdAt: Date.now(),
          },
          ...prev,
        ];
      });
    }

    setIsDemoMode(false);
    return created;
  }, []);

  const updateTransaction = useCallback(
    (id: string, updates: Omit<NewTransactionInput, 'notes'> & { notes?: string }) => {
      const monthKey = updates.date.slice(0, 7);
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === id
            ? {
                ...tx,
                type: updates.type,
                description: updates.description.trim(),
                amount: Math.round(updates.amount * 100) / 100,
                category: updates.category,
                date: updates.date,
                monthKey,
                recurring: updates.recurring,
                notes: updates.notes?.trim() || undefined,
              }
            : tx
        )
      );
      setIsDemoMode(false);
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const target = prev.find((tx) => tx.id === id) ?? null;
      if (target) {
        setLastDeleted(target);
      }
      return prev.filter((tx) => tx.id !== id);
    });
    setIsDemoMode(false);
  }, []);

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    setTransactions((prev) => [lastDeleted, ...prev]);
    setLastDeleted(null);
  }, [lastDeleted]);

  const dismissUndo = useCallback(() => {
    setLastDeleted(null);
  }, []);

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
    setIsDemoMode(false);
    setLastDeleted(null);
  }, []);

  const clearMonthTransactions = useCallback((monthKey: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.monthKey !== monthKey));
    setIsDemoMode(false);
    setLastDeleted(null);
  }, []);

  const loadDemoData = useCallback(() => {
    setTransactions(buildDemoTransactions());
    setRecurringItems(buildDemoRecurringItems());
    setIsDemoMode(true);
    setSelectedMonth(getCurrentMonthKey());
    setLastDeleted(null);
  }, []);

  const isRecurringAppliedInMonth = useCallback(
    (item: RecurringItem, monthKey: string): boolean => {
      return transactions.some(
        (tx) =>
          tx.monthKey === monthKey &&
          tx.type === item.type &&
          tx.description.trim().toLowerCase() ===
            item.description.trim().toLowerCase() &&
          Math.abs(tx.amount - item.amount) < 0.01
      );
    },
    [transactions]
  );

  const addRecurringItem = useCallback(
    (input: NewRecurringInput, alsoApplyToMonth?: string) => {
      const created: RecurringItem = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: input.type,
        description: input.description.trim(),
        amount: Math.round(input.amount * 100) / 100,
        category: input.category,
        dayOfMonth: Math.min(Math.max(input.dayOfMonth, 1), 31),
        active: input.active,
        createdAt: Date.now(),
      };
      setRecurringItems((prev) => [created, ...prev]);

      if (alsoApplyToMonth && created.active) {
        const txDate = clampDayToMonth(alsoApplyToMonth, created.dayOfMonth);
        const tx: Transaction = {
          id: `tx-rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: created.type,
          description: created.description,
          amount: created.amount,
          category: created.category,
          date: txDate,
          monthKey: alsoApplyToMonth,
          recurring: true,
          createdAt: Date.now(),
        };
        setTransactions((prev) => [tx, ...prev]);
      }

      setIsDemoMode(false);
      return created;
    },
    []
  );

  const updateRecurringItem = useCallback(
    (id: string, input: NewRecurringInput) => {
      setRecurringItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                type: input.type,
                description: input.description.trim(),
                amount: Math.round(input.amount * 100) / 100,
                category: input.category,
                dayOfMonth: Math.min(Math.max(input.dayOfMonth, 1), 31),
                active: input.active,
              }
            : item
        )
      );
      setIsDemoMode(false);
    },
    []
  );

  const toggleRecurringItemActive = useCallback((id: string) => {
    setRecurringItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
    setIsDemoMode(false);
  }, []);

  const deleteRecurringItem = useCallback((id: string) => {
    setRecurringItems((prev) => prev.filter((item) => item.id !== id));
    setIsDemoMode(false);
  }, []);

  const applyRecurringItemToMonth = useCallback(
    (item: RecurringItem, monthKey: string): boolean => {
      if (isRecurringAppliedInMonth(item, monthKey)) return false;
      const date = clampDayToMonth(monthKey, item.dayOfMonth);
      const created: Transaction = {
        id: `tx-rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: item.type,
        description: item.description,
        amount: item.amount,
        category: item.category,
        date,
        monthKey,
        recurring: true,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [created, ...prev]);
      setIsDemoMode(false);
      return true;
    },
    [isRecurringAppliedInMonth]
  );

  const applyAllActiveRecurringToMonth = useCallback(
    (monthKey: string): number => {
      const pending = recurringItems.filter(
        (item) => item.active && !isRecurringAppliedInMonth(item, monthKey)
      );
      if (pending.length === 0) return 0;
      const now = Date.now();
      const newTxs: Transaction[] = pending.map((item, idx) => ({
        id: `tx-rec-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        type: item.type,
        description: item.description,
        amount: item.amount,
        category: item.category,
        date: clampDayToMonth(monthKey, item.dayOfMonth),
        monthKey,
        recurring: true,
        createdAt: now + idx,
      }));
      setTransactions((prev) => [...newTxs, ...prev]);
      setIsDemoMode(false);
      return newTxs.length;
    },
    [recurringItems, isRecurringAppliedInMonth]
  );

  const copyRecurringFromPreviousMonth = useCallback(
    (targetMonthKey: string): number => {
      const prevMonthKey = shiftMonthKey(targetMonthKey, -1);
      const recurringInPrev = transactions.filter(
        (tx) => tx.monthKey === prevMonthKey && tx.recurring
      );
      if (recurringInPrev.length === 0) return 0;

      const existingInTarget = transactions.filter(
        (tx) => tx.monthKey === targetMonthKey
      );

      const toAdd: Transaction[] = [];
      recurringInPrev.forEach((src, index) => {
        const alreadyExists = existingInTarget.some(
          (t) =>
            t.type === src.type &&
            t.description.toLowerCase() === src.description.toLowerCase() &&
            Math.abs(t.amount - src.amount) < 0.01
        );
        if (!alreadyExists) {
          const day = src.date.slice(8, 10) || '05';
          const newDate = `${targetMonthKey}-${day}`;
          toAdd.push({
            ...src,
            id: `tx-rec-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
            date: newDate,
            monthKey: targetMonthKey,
            createdAt: Date.now() + index,
          });
        }
      });

      if (toAdd.length > 0) {
        setTransactions((prev) => [...toAdd, ...prev]);
        setIsDemoMode(false);
      }
      return toAdd.length;
    },
    [transactions]
  );

  const importFromJSON = useCallback((rawJson: string): boolean => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) return false;
      const valid = parsed.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          (item.type === 'income' || item.type === 'expense') &&
          typeof item.description === 'string' &&
          typeof item.amount === 'number' &&
          typeof item.date === 'string'
      );
      if (valid.length === 0 && parsed.length > 0) return false;
      setTransactions(
        valid.map((item) => ({
          ...item,
          monthKey: item.monthKey || item.date.slice(0, 7),
          recurring: Boolean(item.recurring),
          createdAt: item.createdAt || Date.now(),
        }))
      );
      setIsDemoMode(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const monthTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.monthKey === selectedMonth)
      .sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.createdAt - a.createdAt;
      });
  }, [transactions, selectedMonth]);

  const monthSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const tx of monthTransactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeCount += 1;
      } else {
        totalExpense += tx.amount;
        expenseCount += 1;
      }
    }

    const balance = totalIncome - totalExpense;
    const commitmentRate =
      totalIncome > 0 ? (totalExpense / totalIncome) * 100 : totalExpense > 0 ? 100 : 0;
    const savingsRate = totalIncome > 0 ? Math.max((balance / totalIncome) * 100, 0) : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      commitmentRate,
      savingsRate,
      incomeCount,
      expenseCount,
      totalCount: monthTransactions.length,
    };
  }, [monthTransactions]);

  const categoryBreakdown: CategorySummary[] = useMemo(() => {
    const totals = new Map<string, { total: number; count: number }>();

    for (const tx of monthTransactions) {
      if (tx.type !== 'expense') continue;
      const current = totals.get(tx.category) ?? { total: 0, count: 0 };
      totals.set(tx.category, {
        total: current.total + tx.amount,
        count: current.count + 1,
      });
    }

    const result: CategorySummary[] = [];
    for (const cat of EXPENSE_CATEGORIES) {
      const entry = totals.get(cat.id);
      if (entry && entry.total > 0) {
        result.push({
          categoryId: cat.id,
          label: cat.label,
          color: cat.color,
          total: entry.total,
          count: entry.count,
          shareOfExpense:
            monthSummary.totalExpense > 0
              ? (entry.total / monthSummary.totalExpense) * 100
              : 0,
          shareOfIncome:
            monthSummary.totalIncome > 0
              ? (entry.total / monthSummary.totalIncome) * 100
              : 0,
        });
      }
    }

    // Handle any unknown categories gracefully
    totals.forEach((entry, catId) => {
      if (!EXPENSE_CATEGORIES.some((c) => c.id === catId)) {
        const meta = getCategoryById(catId);
        result.push({
          categoryId: catId,
          label: meta.label,
          color: meta.color,
          total: entry.total,
          count: entry.count,
          shareOfExpense:
            monthSummary.totalExpense > 0
              ? (entry.total / monthSummary.totalExpense) * 100
              : 0,
          shareOfIncome:
            monthSummary.totalIncome > 0
              ? (entry.total / monthSummary.totalIncome) * 100
              : 0,
        });
      }
    });

    return result.sort((a, b) => b.total - a.total);
  }, [monthTransactions, monthSummary.totalExpense, monthSummary.totalIncome]);

  const incomeEntries = useMemo(
    () => monthTransactions.filter((tx) => tx.type === 'income'),
    [monthTransactions]
  );

  const previousMonthRecurringCount = useMemo(() => {
    const prevKey = shiftMonthKey(selectedMonth, -1);
    return transactions.filter((tx) => tx.monthKey === prevKey && tx.recurring).length;
  }, [transactions, selectedMonth]);

  const monthlyHistory: MonthlyAggregate[] = useMemo(() => {
    const keys: string[] = [];
    for (let i = -5; i <= 0; i++) {
      keys.push(shiftMonthKey(selectedMonth, i));
    }

    return keys.map((key) => {
      const items = transactions.filter((tx) => tx.monthKey === key);
      let inc = 0;
      let exp = 0;
      for (const tx of items) {
        if (tx.type === 'income') inc += tx.amount;
        else exp += tx.amount;
      }
      return {
        monthKey: key,
        label: formatMonthLabel(key),
        totalIncome: inc,
        totalExpense: exp,
        balance: inc - exp,
        commitmentRate: inc > 0 ? (exp / inc) * 100 : exp > 0 ? 100 : 0,
        transactionCount: items.length,
      };
    });
  }, [transactions, selectedMonth]);

  const pendingRecurringCount = useMemo(() => {
    return recurringItems.filter(
      (item) => item.active && !isRecurringAppliedInMonth(item, selectedMonth)
    ).length;
  }, [recurringItems, isRecurringAppliedInMonth, selectedMonth]);

  return {
    transactions,
    recurringItems,
    monthTransactions,
    monthSummary,
    categoryBreakdown,
    incomeEntries,
    monthlyHistory,
    selectedMonth,
    setSelectedMonth,
    isDemoMode,
    lastDeleted,
    previousMonthRecurringCount,
    pendingRecurringCount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    undoDelete,
    dismissUndo,
    clearAllTransactions,
    clearMonthTransactions,
    loadDemoData,
    copyRecurringFromPreviousMonth,
    importFromJSON,
    isRecurringAppliedInMonth,
    addRecurringItem,
    updateRecurringItem,
    toggleRecurringItemActive,
    deleteRecurringItem,
    applyRecurringItemToMonth,
    applyAllActiveRecurringToMonth,
  };
}
