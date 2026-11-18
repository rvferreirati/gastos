import { ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react';
import {
  formatBRL,
  formatPercent,
  getDaysInfoInMonth,
} from '../utils/formatters';

interface SummaryStripProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  commitmentRate: number;
  savingsRate: number;
  incomeCount: number;
  expenseCount: number;
  selectedMonth: string;
  onQuickAddIncome: () => void;
}

export function SummaryStrip({
  totalIncome,
  totalExpense,
  balance,
  commitmentRate,
  savingsRate,
  incomeCount,
  expenseCount,
  selectedMonth,
  onQuickAddIncome,
}: SummaryStripProps) {
  const daysInfo = getDaysInfoInMonth(selectedMonth);
  const dailyAverage =
    daysInfo.elapsedDays > 0 ? totalExpense / daysInfo.elapsedDays : totalExpense;

  const isNegative = balance < 0;
  const isWarning = !isNegative && totalIncome > 0 && commitmentRate >= 80;
  const hasNoIncome = totalIncome === 0;

  let balanceStatusText = 'Saldo positivo';
  let balanceTextClass = 'text-teal-700';
  let balanceCardClass = 'border-teal-200 bg-teal-50/40';

  if (hasNoIncome && totalExpense === 0) {
    balanceStatusText = 'Sem lançamentos no mês';
    balanceTextClass = 'text-slate-900';
    balanceCardClass = 'border-slate-200 bg-white';
  } else if (isNegative) {
    balanceStatusText = 'Saldo negativo';
    balanceTextClass = 'text-red-700';
    balanceCardClass = 'border-red-200 bg-red-50/40';
  } else if (isWarning) {
    balanceStatusText = 'Orçamento apertado';
    balanceTextClass = 'text-amber-700';
    balanceCardClass = 'border-amber-200 bg-amber-50/40';
  }

  const clampedBar = Math.min(Math.max(commitmentRate, 0), 100);

  return (
    <section
      aria-label="Resumo financeiro do mês"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {/* 1. Quanto você ganha */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">
            Quanto você ganha
          </span>
          <button
            type="button"
            onClick={onQuickAddIncome}
            className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adicionar ganho</span>
          </button>
        </div>

        <div className="mt-3">
          <p className="font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {formatBRL(totalIncome)}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>
            {incomeCount === 0
              ? 'Nenhum ganho registrado'
              : incomeCount === 1
                ? '1 fonte de renda'
                : `${incomeCount} fontes de renda`}
          </span>
        </div>
      </div>

      {/* 2. Total gasto no mês */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">
            Total gasto no mês
          </span>
        </div>

        <div className="mt-3">
          <p className="font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {formatBRL(totalExpense)}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <ArrowDownRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>
            {expenseCount === 0
              ? 'Nenhum gasto lançado'
              : `${expenseCount} ${expenseCount === 1 ? 'gasto' : 'gastos'}`}
          </span>
          {expenseCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {formatBRL(dailyAverage)}/dia
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. Quanto sobrou (Saldo final) */}
      <div
        className={`flex flex-col justify-between rounded-xl border p-5 ${balanceCardClass}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">
            Quanto sobrou
          </span>
          <span className={`text-xs font-semibold ${balanceTextClass}`}>
            {balanceStatusText}
          </span>
        </div>

        <div className="mt-3">
          <p
            className={`font-mono text-2xl font-bold tracking-tight tabular-nums ${balanceTextClass}`}
          >
            {formatBRL(balance)}
          </p>
        </div>

        <div className="mt-3 text-xs text-slate-600">
          {totalIncome > 0 ? (
            balance >= 0 ? (
              <span className="tabular-nums">
                Sobram {formatPercent(savingsRate)} do total ganho
              </span>
            ) : (
              <span className="tabular-nums text-red-700 font-medium">
                Gastos superam a renda em {formatBRL(Math.abs(balance))}
              </span>
            )
          ) : (
            <span>Informe seus ganhos para calcular a sobra</span>
          )}
        </div>
      </div>

      {/* 4. Comprometimento da renda */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">
            Uso da renda
          </span>
          <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
            {totalIncome > 0 ? formatPercent(commitmentRate) : '—'}
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isNegative
                  ? 'bg-red-600'
                  : isWarning
                    ? 'bg-amber-500'
                    : 'bg-teal-600'
              }`}
              style={{ width: `${totalIncome > 0 ? clampedBar : 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-600">
            {daysInfo.remainingDays > 0
              ? `Faltam ${daysInfo.remainingDays} ${daysInfo.remainingDays === 1 ? 'dia' : 'dias'} para fechar o mês`
              : 'Mês encerrado'}
          </p>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {totalIncome > 0 && balance > 0 && daysInfo.remainingDays > 0 ? (
            <span className="tabular-nums">
              Margem livre: {formatBRL(balance / daysInfo.remainingDays)}/dia
            </span>
          ) : (
            <span>Meta saudável: gastar até 80% da renda</span>
          )}
        </div>
      </div>
    </section>
  );
}
