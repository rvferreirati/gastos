import { Pencil, Plus } from 'lucide-react';
import { CategorySummary, Transaction } from '../types/finance';
import { formatBRL, formatPercent, formatShortDate } from '../utils/formatters';

interface CategoryBreakdownProps {
  categories: CategorySummary[];
  incomeEntries: Transaction[];
  totalIncome: number;
  totalExpense: number;
  selectedCategoryFilter: string;
  onSelectCategory: (catId: string) => void;
  onAddIncome: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export function CategoryBreakdown({
  categories,
  incomeEntries,
  totalIncome,
  totalExpense,
  selectedCategoryFilter,
  onSelectCategory,
  onAddIncome,
  onEditTransaction,
}: CategoryBreakdownProps) {
  return (
    <div className="space-y-6">
      {/* Income Sources Box */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Ganhos do mês
            </h2>
            <p className="text-xs text-slate-500">
              Fontes de renda somadas no orçamento
            </p>
          </div>
          <button
            type="button"
            onClick={onAddIncome}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo ganho</span>
          </button>
        </div>

        {incomeEntries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Você ainda não informou seus ganhos neste mês.
            </p>
            <button
              type="button"
              onClick={onAddIncome}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Inserir salário ou renda agora
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incomeEntries.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {inc.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatShortDate(inc.date)}
                    {inc.recurring ? ' · Fixo mensal' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-sm font-semibold text-emerald-700 tabular-nums">
                    {formatBRL(inc.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditTransaction(inc)}
                    aria-label={`Editar ganho ${inc.description}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-3 text-xs font-semibold text-slate-700">
              <span>Total de entradas</span>
              <span className="font-mono text-sm text-emerald-700 tabular-nums">
                {formatBRL(totalIncome)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Expense Breakdown by Category */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Para onde foi o dinheiro
            </h2>
            <p className="text-xs text-slate-500">
              Clique em uma categoria para filtrar o extrato
            </p>
          </div>
          {selectedCategoryFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="text-xs font-medium text-teal-700 hover:text-teal-800 whitespace-nowrap"
            >
              Ver todas
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Nenhum gasto lançado ainda para agrupar por categoria.
          </div>
        ) : (
          <div className="space-y-3.5">
            {categories.map((cat) => {
              const isSelected = selectedCategoryFilter === cat.categoryId;
              return (
                <button
                  key={cat.categoryId}
                  type="button"
                  onClick={() =>
                    onSelectCategory(isSelected ? 'all' : cat.categoryId)
                  }
                  className={`block w-full text-left rounded-lg p-2 -mx-2 transition-colors ${
                    isSelected
                      ? 'bg-teal-50/70 ring-1 ring-teal-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {cat.label}
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                      {formatBRL(cat.total)}
                    </span>
                  </div>

                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(Math.max(cat.shareOfExpense, 2), 100)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500 tabular-nums">
                    <span>
                      {cat.count} {cat.count === 1 ? 'gasto' : 'gastos'} ·{' '}
                      {formatPercent(cat.shareOfExpense)} dos gastos
                    </span>
                    {totalIncome > 0 && (
                      <span>{formatPercent(cat.shareOfIncome)} da renda</span>
                    )}
                  </div>
                </button>
              );
            })}

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Total gasto</span>
              <span className="font-mono text-sm text-slate-900 tabular-nums">
                {formatBRL(totalExpense)}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
