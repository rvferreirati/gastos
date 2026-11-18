import React, { useMemo, useState } from 'react';
import {
  Check,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat,
  Trash2,
  X,
} from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryById,
} from '../constants/categories';
import { RecurringItem, TransactionType } from '../types/finance';
import { NewRecurringInput } from '../hooks/useFinanceStore';
import {
  formatBRL,
  formatMonthLabel,
  formatPercent,
  parseCurrencyInput,
} from '../utils/formatters';

interface RecurringViewProps {
  recurringItems: RecurringItem[];
  selectedMonth: string;
  totalIncome: number;
  currentBalance: number;
  isAppliedInMonth: (item: RecurringItem, monthKey: string) => boolean;
  onAddRecurring: (input: NewRecurringInput, alsoApplyToMonth?: string) => void;
  onUpdateRecurring: (id: string, input: NewRecurringInput) => void;
  onToggleActive: (id: string) => void;
  onDeleteRecurring: (id: string) => void;
  onApplyOneToMonth: (item: RecurringItem) => boolean;
  onApplyAllPendingToMonth: () => number;
  onGoToOverview: () => void;
}

export function RecurringView({
  recurringItems,
  selectedMonth,
  totalIncome,
  currentBalance,
  isAppliedInMonth,
  onAddRecurring,
  onUpdateRecurring,
  onToggleActive,
  onDeleteRecurring,
  onApplyOneToMonth,
  onApplyAllPendingToMonth,
  onGoToOverview,
}: RecurringViewProps) {
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [dayOfMonth, setDayOfMonth] = useState('10');
  const [alsoLaunchNow, setAlsoLaunchNow] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmountRaw, setEditAmountRaw] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDay, setEditDay] = useState('10');

  const monthLabel = formatMonthLabel(selectedMonth);

  const stats = useMemo(() => {
    const activeExpenses = recurringItems.filter(
      (r) => r.type === 'expense' && r.active
    );
    const activeIncomes = recurringItems.filter(
      (r) => r.type === 'income' && r.active
    );
    const totalRecurringExpense = activeExpenses.reduce(
      (acc, r) => acc + r.amount,
      0
    );
    const totalRecurringIncome = activeIncomes.reduce(
      (acc, r) => acc + r.amount,
      0
    );

    const activeItems = recurringItems.filter((r) => r.active);
    const pendingInMonth = activeItems.filter(
      (r) => !isAppliedInMonth(r, selectedMonth)
    );
    const appliedInMonthCount = activeItems.length - pendingInMonth.length;

    const pendingDelta = pendingInMonth.reduce((acc, item) => {
      return item.type === 'income' ? acc + item.amount : acc - item.amount;
    }, 0);
    const projectedBalance = currentBalance + pendingDelta;

    const incomeWeight =
      totalIncome > 0 ? (totalRecurringExpense / totalIncome) * 100 : 0;

    return {
      totalRecurringExpense,
      totalRecurringIncome,
      activeExpensesCount: activeExpenses.length,
      pendingCount: pendingInMonth.length,
      appliedInMonthCount,
      projectedBalance,
      incomeWeight,
    };
  }, [
    recurringItems,
    isAppliedInMonth,
    selectedMonth,
    totalIncome,
    currentBalance,
  ]);

  const filteredItems = useMemo(() => {
    return recurringItems.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      return true;
    });
  }, [recurringItems, typeFilter]);

  const handleFormTypeChange = (nextType: TransactionType) => {
    setFormType(nextType);
    setCategory(
      nextType === 'income'
        ? INCOME_CATEGORIES[0].id
        : EXPENSE_CATEGORIES[0].id
    );
    setError(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseCurrencyInput(amountRaw);
    const parsedDay = Number.parseInt(dayOfMonth, 10);
    const validDay =
      Number.isFinite(parsedDay) && parsedDay >= 1 && parsedDay <= 31
        ? parsedDay
        : 10;

    if (!description.trim()) {
      setError('Informe uma descrição para o gasto recorrente.');
      return;
    }
    if (numericAmount <= 0) {
      setError('Informe um valor mensal maior que zero.');
      return;
    }

    onAddRecurring(
      {
        type: formType,
        description,
        amount: numericAmount,
        category,
        dayOfMonth: validDay,
        active: true,
      },
      alsoLaunchNow ? selectedMonth : undefined
    );

    setDescription('');
    setAmountRaw('');
    setDayOfMonth('10');
    setError(null);
    setFeedback(
      alsoLaunchNow
        ? `Recorrente salvo e lançado em ${monthLabel}.`
        : 'Recorrente salvo na sua lista mensal.'
    );
    setTimeout(() => setFeedback(null), 3500);
  };

  const startEdit = (item: RecurringItem) => {
    setEditingItem(item);
    setEditDesc(item.description);
    setEditAmountRaw(item.amount.toFixed(2).replace('.', ','));
    setEditCategory(item.category);
    setEditDay(String(item.dayOfMonth));
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const numericAmount = parseCurrencyInput(editAmountRaw);
    const parsedDay = Number.parseInt(editDay, 10);
    const validDay =
      Number.isFinite(parsedDay) && parsedDay >= 1 && parsedDay <= 31
        ? parsedDay
        : editingItem.dayOfMonth;

    if (!editDesc.trim() || numericAmount <= 0) return;

    onUpdateRecurring(editingItem.id, {
      type: editingItem.type,
      description: editDesc,
      amount: numericAmount,
      category: editCategory,
      dayOfMonth: validDay,
      active: editingItem.active,
    });
    setEditingItem(null);
  };

  const handleApplyAll = () => {
    const added = onApplyAllPendingToMonth();
    if (added > 0) {
      setFeedback(
        `${added} ${added === 1 ? 'lançamento recorrente aplicado' : 'lançamentos recorrentes aplicados'} em ${monthLabel}.`
      );
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const formCategories =
    formType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-600">
            Gastos recorrentes ativos
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {formatBRL(stats.totalRecurringExpense)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {stats.activeExpensesCount}{' '}
            {stats.activeExpensesCount === 1
              ? 'conta fixa cadastrada'
              : 'contas fixas cadastradas'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-600">
            Comprometido com fixos
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {totalIncome > 0 ? formatPercent(stats.incomeWeight) : '—'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {totalIncome > 0
              ? `Da sua renda de ${monthLabel}`
              : `Informe ganhos em ${monthLabel} para calcular`}
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-medium text-slate-600">
              Situação em {monthLabel}
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-slate-900 tabular-nums">
              {stats.appliedInMonthCount} lançados · {stats.pendingCount}{' '}
              {stats.pendingCount === 1 ? 'pendente' : 'pendentes'}
            </p>
            {stats.pendingCount > 0 && (
              <p className="mt-1 text-xs text-slate-600 tabular-nums">
                Saldo previsto após lançar:{' '}
                <span
                  className={`font-mono font-semibold ${
                    stats.projectedBalance >= 0
                      ? 'text-teal-700'
                      : 'text-red-700'
                  }`}
                >
                  {formatBRL(stats.projectedBalance)}
                </span>
              </p>
            )}
          </div>
          {stats.pendingCount > 0 ? (
            <button
              type="button"
              onClick={handleApplyAll}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-medium text-white hover:bg-teal-800 transition-colors whitespace-nowrap"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>
                Lançar {stats.pendingCount}{' '}
                {stats.pendingCount === 1 ? 'pendente' : 'pendentes'} em{' '}
                {monthLabel}
              </span>
            </button>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-emerald-700">
                Tudo lançado no mês
              </p>
              <button
                type="button"
                onClick={onGoToOverview}
                className="text-xs font-medium text-teal-700 hover:text-teal-800 whitespace-nowrap"
              >
                Ver Visão do Mês
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Split: Form + List */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Form Card */}
        <section className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Novo item recorrente
              </h2>
              <p className="text-xs text-slate-500">
                Contas e gastos que se repetem todo mês
              </p>
            </div>

            <div
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
              role="group"
              aria-label="Tipo de recorrente"
            >
              <button
                type="button"
                onClick={() => handleFormTypeChange('expense')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                  formType === 'expense'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gasto fixo
              </button>
              <button
                type="button"
                onClick={() => handleFormTypeChange('income')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                  formType === 'income'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ganho fixo
              </button>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label
                htmlFor="rec-desc"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Descrição
              </label>
              <input
                id="rec-desc"
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={
                  formType === 'expense'
                    ? 'Ex.: Aluguel, Internet, Academia, Plano de saúde'
                    : 'Ex.: Salário, Pró-labore, Aluguel recebido'
                }
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="rec-amount"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Valor mensal (R$)
                </label>
                <input
                  id="rec-amount"
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

              <div>
                <label
                  htmlFor="rec-day"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Dia do vencimento
                </label>
                <input
                  id="rec-day"
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="rec-cat"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Categoria
              </label>
              <select
                id="rec-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
              >
                {formCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={alsoLaunchNow}
                onChange={(e) => setAlsoLaunchNow(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              <span>Já lançar em {monthLabel} ao salvar</span>
            </label>

            {error && (
              <p className="text-xs font-medium text-red-600" role="alert">
                {error}
              </p>
            )}

            {feedback && (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                <span>{feedback}</span>
              </p>
            )}

            <button
              type="submit"
              className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>
                {formType === 'expense'
                  ? 'Salvar gasto recorrente'
                  : 'Salvar ganho recorrente'}
              </span>
            </button>
          </form>
        </section>

        {/* Recurring List */}
        <section className="xl:col-span-7 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex items-baseline gap-2.5">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Lista de recorrentes
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {filteredItems.length}{' '}
                {filteredItems.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'expense', label: 'Gastos fixos' },
                  { id: 'income', label: 'Ganhos fixos' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    typeFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-2">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Nenhum gasto recorrente cadastrado
              </h3>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500">
                Cadastre ao lado suas despesas mensais fixas (como aluguel,
                internet, energia e assinaturas) para aplicá-las todo mês com
                apenas um clique.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const cat = getCategoryById(item.category);
                const applied = isAppliedInMonth(item, selectedMonth);
                const isEditing = editingItem?.id === item.id;
                const isIncome = item.type === 'income';

                if (isEditing) {
                  const editCats = isIncome
                    ? INCOME_CATEGORIES
                    : EXPENSE_CATEGORIES;
                  return (
                    <form
                      key={item.id}
                      onSubmit={saveEdit}
                      className="bg-slate-50/80 px-5 py-4 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="sm:col-span-5 h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editAmountRaw}
                          onChange={(e) => setEditAmountRaw(e.target.value)}
                          className="sm:col-span-3 h-9 rounded-lg border border-slate-200 bg-white px-2.5 font-mono text-sm text-slate-900 tabular-nums"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="sm:col-span-3 h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900"
                        >
                          {editCats.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={editDay}
                          onChange={(e) => setEditDay(e.target.value)}
                          className="sm:col-span-1 h-9 rounded-lg border border-slate-200 bg-white px-2 font-mono text-xs text-slate-900 tabular-nums"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingItem(null)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Cancelar</span>
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Salvar</span>
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 px-5 py-3.5 transition-colors ${
                      item.active ? 'hover:bg-slate-50/70' : 'bg-slate-50/60 opacity-70'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.description}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="tabular-nums">
                          Todo dia {String(item.dayOfMonth).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{cat.label}</span>
                        <span aria-hidden="true">·</span>
                        <span>{isIncome ? 'Ganho fixo' : 'Gasto fixo'}</span>
                        <span aria-hidden="true">·</span>
                        {!item.active ? (
                          <span className="text-slate-500 font-medium">
                            Pausado
                          </span>
                        ) : applied ? (
                          <span className="text-emerald-700 font-medium">
                            Lançado em {monthLabel}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">
                            Pendente em {monthLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
                          isIncome ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {formatBRL(item.amount)}
                      </span>

                      {item.active && !applied && (
                        <button
                          type="button"
                          onClick={() => onApplyOneToMonth(item)}
                          className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 hover:bg-teal-100 transition-colors whitespace-nowrap"
                        >
                          Lançar no mês
                        </button>
                      )}

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onToggleActive(item.id)}
                          aria-label={
                            item.active
                              ? `Pausar ${item.description}`
                              : `Reativar ${item.description}`
                          }
                          title={item.active ? 'Pausar recorrência' : 'Ativar recorrência'}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          {item.active ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          aria-label={`Editar ${item.description}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecurring(item.id)}
                          aria-label={`Excluir ${item.description}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
