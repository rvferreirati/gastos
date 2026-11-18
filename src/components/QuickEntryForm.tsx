import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../constants/categories';
import { TransactionType } from '../types/finance';
import {
  getTodayDateForMonth,
  parseCurrencyInput,
} from '../utils/formatters';
import { NewTransactionInput } from '../hooks/useFinanceStore';

interface QuickEntryFormProps {
  selectedMonth: string;
  defaultType?: TransactionType;
  onAdd: (input: NewTransactionInput) => void;
  compact?: boolean;
  onSuccess?: () => void;
}

export function QuickEntryForm({
  selectedMonth,
  defaultType = 'expense',
  onAdd,
  compact = false,
  onSuccess,
}: QuickEntryFormProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [category, setCategory] = useState(
    defaultType === 'income' ? INCOME_CATEGORIES[0].id : EXPENSE_CATEGORIES[0].id
  );
  const [date, setDate] = useState(() => getTodayDateForMonth(selectedMonth));
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setDate(getTodayDateForMonth(selectedMonth));
  }, [selectedMonth]);

  useEffect(() => {
    setType(defaultType);
    setCategory(
      defaultType === 'income'
        ? INCOME_CATEGORIES[0].id
        : EXPENSE_CATEGORIES[0].id
    );
  }, [defaultType]);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    setCategory(
      nextType === 'income' ? INCOME_CATEGORIES[0].id : EXPENSE_CATEGORIES[0].id
    );
    setError(null);
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseCurrencyInput(amountRaw);
    if (!description.trim()) {
      setError('Informe uma descrição para o lançamento.');
      return;
    }
    if (numericAmount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if (!date) {
      setError('Selecione uma data válida.');
      return;
    }

    onAdd({
      type,
      description,
      amount: numericAmount,
      category,
      date,
      recurring,
    });

    setDescription('');
    setAmountRaw('');
    setRecurring(false);
    setError(null);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    onSuccess?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? 'space-y-4'
          : 'rounded-xl border border-slate-200 bg-white p-5 space-y-4'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Lançamento rápido
          </h2>
          <p className="text-xs text-slate-500">
            Registre um ganho recebido ou um gasto do mês
          </p>
        </div>

        {/* Segmented Type Control */}
        <div
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          role="group"
          aria-label="Tipo de lançamento"
        >
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              type === 'expense'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              type === 'income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ganho
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5">
          <label
            htmlFor={compact ? 'modal-desc' : 'quick-desc'}
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Descrição
          </label>
          <input
            id={compact ? 'modal-desc' : 'quick-desc'}
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError(null);
            }}
            placeholder={
              type === 'income'
                ? 'Ex.: Salário, Freela, Bônus'
                : 'Ex.: Mercado, Aluguel, Farmácia'
            }
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor={compact ? 'modal-amount' : 'quick-amount'}
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Valor (R$)
          </label>
          <input
            id={compact ? 'modal-amount' : 'quick-amount'}
            type="text"
            inputMode="decimal"
            value={amountRaw}
            onChange={(e) => {
              setAmountRaw(e.target.value);
              if (error) setError(null);
            }}
            placeholder="0,00"
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
          />
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor={compact ? 'modal-category' : 'quick-category'}
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Categoria
          </label>
          <select
            id={compact ? 'modal-category' : 'quick-category'}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor={compact ? 'modal-date' : 'quick-date'}
              className="text-xs font-medium text-slate-600"
            >
              Data:
            </label>
            <input
              id={compact ? 'modal-date' : 'quick-date'}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            <span>Repetir todo mês (fixo)</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {justSaved && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              Lançado
            </span>
          )}
          <button
            type="submit"
            className={`h-10 rounded-lg px-5 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 ${
              type === 'income'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {type === 'income' ? 'Adicionar Ganho' : 'Lançar Gasto'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
