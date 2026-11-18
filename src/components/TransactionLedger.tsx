import { useMemo, useState } from 'react';
import { Pencil, Repeat, Search, Trash2, X } from 'lucide-react';
import { getCategoryById } from '../constants/categories';
import { Transaction, TransactionType } from '../types/finance';
import { formatBRL, formatShortDate } from '../utils/formatters';

interface TransactionLedgerProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  selectedCategoryFilter: string;
  onChangeCategoryFilter: (catId: string) => void;
  previousMonthRecurringCount: number;
  onCopyRecurring: () => void;
  onQuickAddIncome: () => void;
  onQuickAddExpense: () => void;
  title?: string;
}

export function TransactionLedger({
  transactions,
  onEdit,
  onDelete,
  selectedCategoryFilter,
  onChangeCategoryFilter,
  previousMonthRecurringCount,
  onCopyRecurring,
  onQuickAddIncome,
  onQuickAddExpense,
  title = 'Extrato do mês',
}: TransactionLedgerProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');

  const availableCategories = useMemo(() => {
    const ids = new Set<string>();
    for (const tx of transactions) {
      if (typeFilter === 'all' || tx.type === typeFilter) {
        ids.add(tx.category);
      }
    }
    return Array.from(ids).map((id) => getCategoryById(id));
  }, [transactions, typeFilter]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (
        selectedCategoryFilter !== 'all' &&
        tx.category !== selectedCategoryFilter
      ) {
        return false;
      }
      if (query) {
        const catLabel = getCategoryById(tx.category).label.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(query);
        const matchCat = catLabel.includes(query);
        if (!matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, selectedCategoryFilter, search]);

  const filteredTotals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const tx of filtered) {
      if (tx.type === 'income') inc += tx.amount;
      else exp += tx.amount;
    }
    return { inc, exp, net: inc - exp };
  }, [filtered]);

  const hasActiveFilters =
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    selectedCategoryFilter !== 'all';

  return (
    <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Toolbar Header */}
      <div className="border-b border-slate-200 px-5 py-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-display text-base font-semibold text-slate-900">
              {title}
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'lançamento' : 'lançamentos'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Segmented Filter */}
            <div
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
              role="group"
              aria-label="Filtrar por tipo"
            >
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'expense', label: 'Gastos' },
                  { id: 'income', label: 'Ganhos' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
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
        </div>

        {/* Search + Category Filter Row */}
        {transactions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar descrição ou categoria..."
                aria-label="Buscar lançamentos"
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpar busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => onChangeCategoryFilter(e.target.value)}
              aria-label="Filtrar por categoria"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
            >
              <option value="all">Todas as categorias</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                  onChangeCategoryFilter('all');
                }}
                className="h-9 rounded-lg px-2.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty States */}
      {transactions.length === 0 ? (
        <div className="px-6 py-12 text-center space-y-4">
          <div className="mx-auto max-w-md space-y-1.5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Nenhum lançamento neste mês
            </h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Comece informando quanto você ganha no mês e depois vá lançando
              seus gastos para acompanhar quanto vai sobrar no final.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={onQuickAddIncome}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap"
            >
              Registrar meu ganho
            </button>
            <button
              type="button"
              onClick={onQuickAddExpense}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Lançar primeiro gasto
            </button>
            {previousMonthRecurringCount > 0 && (
              <button
                type="button"
                onClick={onCopyRecurring}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-medium text-teal-800 hover:bg-teal-100 transition-colors whitespace-nowrap"
              >
                <Repeat className="h-3.5 w-3.5" />
                <span>
                  Copiar {previousMonthRecurringCount} fixos do mês anterior
                </span>
              </button>
            )}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-6 py-10 text-center space-y-2">
          <p className="text-sm font-medium text-slate-800">
            Nenhum lançamento encontrado para este filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setTypeFilter('all');
              onChangeCategoryFilter('all');
            }}
            className="text-xs font-medium text-teal-700 hover:text-teal-800"
          >
            Mostrar todos os lançamentos do mês
          </button>
        </div>
      ) : (
        <>
          {/* Table List */}
          <div className="divide-y divide-slate-100">
            {filtered.map((tx) => {
              const cat = getCategoryById(tx.category);
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {tx.description}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span className="tabular-nums">
                        {formatShortDate(tx.date)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{cat.label}</span>
                      <span aria-hidden="true">·</span>
                      <span>{isIncome ? 'Ganho' : 'Gasto'}</span>
                      {tx.recurring && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 font-medium">
                            Fixo mensal
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
                        isIncome ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        aria-label={`Editar ${tx.description}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tx.id)}
                        aria-label={`Excluir ${tx.description}`}
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

          {/* Filtered Summary Footer */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs">
              <span className="font-medium text-slate-600">
                Subtotal do filtro atual
              </span>
              <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
                {filteredTotals.inc > 0 && (
                  <span className="text-emerald-700">
                    Ganhos: {formatBRL(filteredTotals.inc)}
                  </span>
                )}
                {filteredTotals.exp > 0 && (
                  <span className="text-slate-800">
                    Gastos: {formatBRL(filteredTotals.exp)}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
