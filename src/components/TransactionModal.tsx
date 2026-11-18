import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../constants/categories';
import { Transaction, TransactionType } from '../types/finance';
import {
  getTodayDateForMonth,
  parseCurrencyInput,
} from '../utils/formatters';
import { NewTransactionInput } from '../hooks/useFinanceStore';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onSaveNew: (input: NewTransactionInput) => void;
  onSaveEdit: (id: string, input: NewTransactionInput) => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  selectedMonth,
  initialType = 'expense',
  editingTransaction = null,
  onSaveNew,
  onSaveEdit,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [description, setDescription] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [date, setDate] = useState(() => getTodayDateForMonth(selectedMonth));
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmountRaw(editingTransaction.amount.toFixed(2).replace('.', ','));
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setRecurring(editingTransaction.recurring);
    } else {
      setType(initialType);
      setDescription('');
      setAmountRaw('');
      setCategory(
        initialType === 'income'
          ? INCOME_CATEGORIES[0].id
          : EXPENSE_CATEGORIES[0].id
      );
      setDate(getTodayDateForMonth(selectedMonth));
      setRecurring(false);
    }
    setError(null);
  }, [isOpen, editingTransaction, initialType, selectedMonth]);

  if (!isOpen) return null;

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    const list = nextType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setCategory(list[0].id);
    setError(null);
  };

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
      setError('Informe uma data válida.');
      return;
    }

    const payload: NewTransactionInput = {
      type,
      description,
      amount: numericAmount,
      category,
      date,
      recurring,
    };

    if (editingTransaction) {
      onSaveEdit(editingTransaction.id, payload);
    } else {
      onSaveNew(payload);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <h2
            id="tx-modal-title"
            className="font-display text-base font-semibold text-slate-900"
          >
            {editingTransaction ? 'Editar lançamento' : 'Novo lançamento'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Tipo</span>
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
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
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  type === 'income'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ganho
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="modal-tx-desc"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Descrição
            </label>
            <input
              id="modal-tx-desc"
              type="text"
              autoFocus
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                type === 'income'
                  ? 'Ex.: Salário, Freelance, Comissão'
                  : 'Ex.: Mercado, Conta de luz, Restaurante'
              }
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="modal-tx-amount"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Valor (R$)
              </label>
              <input
                id="modal-tx-amount"
                type="text"
                inputMode="decimal"
                value={amountRaw}
                onChange={(e) => {
                  setAmountRaw(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="0,00"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
              />
            </div>

            <div>
              <label
                htmlFor="modal-tx-date"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Data
              </label>
              <input
                id="modal-tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="modal-tx-cat"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Categoria
            </label>
            <select
              id="modal-tx-cat"
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

          <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            <span>Repetir todo mês (ganho ou conta fixa)</span>
          </label>

          {error && (
            <p className="text-xs font-medium text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`h-10 rounded-lg px-5 text-sm font-medium text-white transition-colors ${
                type === 'income'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
            >
              {editingTransaction ? 'Salvar alterações' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
