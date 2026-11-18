import { MonthlyAggregate } from '../types/finance';
import {
  formatBRL,
  formatPercent,
  formatShortMonthLabel,
} from '../utils/formatters';

interface MonthlyComparisonProps {
  history: MonthlyAggregate[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
}

export function MonthlyComparison({
  history,
  selectedMonth,
  onSelectMonth,
}: MonthlyComparisonProps) {
  const maxVal = Math.max(
    ...history.flatMap((m) => [m.totalIncome, m.totalExpense]),
    100
  );

  const totalBalance6m = history.reduce((acc, m) => acc + m.balance, 0);
  const activeMonths = history.filter((m) => m.transactionCount > 0);
  const avgSavingsRate =
    activeMonths.length > 0
      ? activeMonths.reduce((acc, m) => {
          const rate =
            m.totalIncome > 0 ? (m.balance / m.totalIncome) * 100 : 0;
          return acc + rate;
        }, 0) / activeMonths.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards for 6 Months */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-600">
            Meses com registros
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {activeMonths.length} de {history.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-600">
            Saldo acumulado (6 meses)
          </p>
          <p
            className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
              totalBalance6m >= 0 ? 'text-teal-700' : 'text-red-700'
            }`}
          >
            {formatBRL(totalBalance6m)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-600">
            Média de sobra mensal
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {formatPercent(avgSavingsRate)}
          </p>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Ganhos vs. Gastos nos últimos 6 meses
            </h2>
            <p className="text-xs text-slate-500">
              Clique em um mês abaixo para abrir o detalhamento completo
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600" />
              Ganhos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-slate-800" />
              Gastos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-3 sm:gap-5 pt-4 items-end h-56 border-b border-slate-200 pb-3">
          {history.map((m) => {
            const incomeH = (m.totalIncome / maxVal) * 100;
            const expenseH = (m.totalExpense / maxVal) * 100;
            const isSelected = m.monthKey === selectedMonth;
            return (
              <button
                key={m.monthKey}
                type="button"
                onClick={() => onSelectMonth(m.monthKey)}
                className={`group flex h-full flex-col justify-end items-center gap-2 rounded-lg px-1 pt-2 transition-colors ${
                  isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex w-full max-w-[56px] flex-1 items-end justify-center gap-1.5">
                  <div
                    className="w-1/2 rounded-t-sm bg-emerald-600 transition-all duration-300"
                    style={{
                      height: `${m.totalIncome > 0 ? Math.max(incomeH, 4) : 0}%`,
                    }}
                    title={`Ganhos: ${formatBRL(m.totalIncome)}`}
                  />
                  <div
                    className="w-1/2 rounded-t-sm bg-slate-800 transition-all duration-300"
                    style={{
                      height: `${m.totalExpense > 0 ? Math.max(expenseH, 4) : 0}%`,
                    }}
                    title={`Gastos: ${formatBRL(m.totalExpense)}`}
                  />
                </div>
                <span
                  className={`text-xs whitespace-nowrap ${
                    isSelected
                      ? 'font-semibold text-teal-700'
                      : 'text-slate-600'
                  }`}
                >
                  {formatShortMonthLabel(m.monthKey)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tabular Breakdown */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-2.5 pr-4">Mês</th>
                <th className="py-2.5 px-4 text-right">Ganhos</th>
                <th className="py-2.5 px-4 text-right">Gastos</th>
                <th className="py-2.5 px-4 text-right">Sobrou</th>
                <th className="py-2.5 pl-4 text-right">Comprometido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {history
                .slice()
                .reverse()
                .map((m) => {
                  const isSelected = m.monthKey === selectedMonth;
                  return (
                    <tr
                      key={m.monthKey}
                      onClick={() => onSelectMonth(m.monthKey)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 pr-4 font-medium text-slate-900 whitespace-nowrap">
                        {m.label}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 tabular-nums whitespace-nowrap">
                        {formatBRL(m.totalIncome)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 tabular-nums whitespace-nowrap">
                        {formatBRL(m.totalExpense)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                          m.balance >= 0 ? 'text-teal-700' : 'text-red-700'
                        }`}
                      >
                        {formatBRL(m.balance)}
                      </td>
                      <td className="py-3 pl-4 text-right font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {m.totalIncome > 0
                          ? formatPercent(m.commitmentRate)
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
