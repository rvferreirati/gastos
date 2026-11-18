import { ArrowRight, Check, Repeat } from 'lucide-react';
import { RecurringItem } from '../types/finance';
import { formatBRL, formatMonthLabel } from '../utils/formatters';

interface RecurringMonthCardProps {
  recurringItems: RecurringItem[];
  selectedMonth: string;
  isAppliedInMonth: (item: RecurringItem, monthKey: string) => boolean;
  onApplyOneToMonth: (item: RecurringItem) => boolean;
  onApplyAllPendingToMonth: () => number;
  onOpenRecurringTab: () => void;
}

export function RecurringMonthCard({
  recurringItems,
  selectedMonth,
  isAppliedInMonth,
  onApplyOneToMonth,
  onApplyAllPendingToMonth,
  onOpenRecurringTab,
}: RecurringMonthCardProps) {
  const activeExpenses = recurringItems.filter(
    (r) => r.active && r.type === 'expense'
  );
  const activeItems = recurringItems.filter((r) => r.active);
  const pendingItems = activeItems.filter(
    (r) => !isAppliedInMonth(r, selectedMonth)
  );

  const totalFixedExpenses = activeExpenses.reduce(
    (acc, r) => acc + r.amount,
    0
  );
  const monthLabel = formatMonthLabel(selectedMonth);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Recorrentes em {monthLabel}
          </h2>
          <p className="text-xs text-slate-500">
            {activeExpenses.length > 0
              ? `Fixos previstos: ${formatBRL(totalFixedExpenses)}/mês`
              : 'Nenhum gasto recorrente ativo'}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenRecurringTab}
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 whitespace-nowrap shrink-0"
        >
          <span>Gerenciar</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {activeItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Cadastre aluguel, internet e assinaturas para lançar todo mês com 1 clique.
          </p>
          <button
            type="button"
            onClick={onOpenRecurringTab}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            Abrir aba Recorrentes
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {activeItems.slice(0, 6).map((item) => {
              const applied = isAppliedInMonth(item, selectedMonth);
              const isIncome = item.type === 'income';
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.description}
                    </p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      Dia {String(item.dayOfMonth).padStart(2, '0')} ·{' '}
                      {applied ? (
                        <span className="text-emerald-700 font-medium">
                          Lançado
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Pendente
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        isIncome ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {formatBRL(item.amount)}
                    </span>

                    {applied ? (
                      <span
                        aria-label="Já lançado no mês"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onApplyOneToMonth(item)}
                        className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800 hover:bg-teal-100 transition-colors whitespace-nowrap"
                      >
                        Lançar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {activeItems.length > 6 && (
            <button
              type="button"
              onClick={onOpenRecurringTab}
              className="w-full text-center text-xs font-medium text-slate-600 hover:text-slate-900 pt-1"
            >
              Ver todos os {activeItems.length} itens recorrentes
            </button>
          )}

          {pendingItems.length > 0 && (
            <button
              type="button"
              onClick={onApplyAllPendingToMonth}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-medium text-white hover:bg-teal-800 transition-colors whitespace-nowrap"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>
                Lançar {pendingItems.length}{' '}
                {pendingItems.length === 1 ? 'pendente' : 'pendentes'} no mês
              </span>
            </button>
          )}
        </>
      )}
    </section>
  );
}
