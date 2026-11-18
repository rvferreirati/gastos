import { Menu, Plus } from 'lucide-react';
import { ViewMode } from '../types/finance';
import { formatMonthLabel } from '../utils/formatters';

interface TopBarProps {
  activeView: ViewMode;
  selectedMonth: string;
  onOpenMobileMenu: () => void;
  onOpenNewModal: () => void;
}

const VIEW_TITLES: Record<ViewMode, string> = {
  overview: 'Visão do Mês',
  ledger: 'Extrato de Lançamentos',
  recurring: 'Gastos Recorrentes',
  categories: 'Gastos por Categoria',
  comparison: 'Comparativo Mensal',
};

export function TopBar({
  activeView,
  selectedMonth,
  onOpenMobileMenu,
  onOpenNewModal,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menu lateral"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="font-display font-semibold text-slate-900 truncate">
            {VIEW_TITLES[activeView]}
          </span>
          <span className="text-slate-300" aria-hidden="true">
            /
          </span>
          <span className="text-slate-600 whitespace-nowrap shrink-0">
            {formatMonthLabel(selectedMonth)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenNewModal}
        className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 transition-colors whitespace-nowrap shrink-0"
      >
        <Plus className="h-4 w-4 shrink-0" />
        <span>Novo Lançamento</span>
      </button>
    </header>
  );
}
