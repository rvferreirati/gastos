import React, { useRef, useState } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutDashboard,
  ListOrdered,
  PieChart,
  Repeat,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ViewMode } from '../types/finance';
import {
  formatMonthLabel,
  getCurrentMonthKey,
  shiftMonthKey,
} from '../utils/formatters';

interface SidebarProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (raw: string) => boolean;
  onClearMonth: () => void;
  onClearAll: () => void;
  onLoadDemo: () => void;
  isDemoMode: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: ViewMode; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Visão do Mês', icon: LayoutDashboard },
  { id: 'ledger', label: 'Lançamentos', icon: ListOrdered },
  { id: 'recurring', label: 'Recorrentes', icon: Repeat },
  { id: 'categories', label: 'Categorias', icon: PieChart },
  { id: 'comparison', label: 'Comparativo', icon: BarChart3 },
];

export function Sidebar({
  activeView,
  onSelectView,
  selectedMonth,
  onSelectMonth,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onClearMonth,
  onClearAll,
  onLoadDemo,
  isDemoMode,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const [confirmMode, setConfirmMode] = useState<'month' | 'all' | null>(null);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMonthKey = getCurrentMonthKey();
  const isCurrentMonth = selectedMonth === currentMonthKey;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImportJSON(String(reader.result ?? ''));
      setImportFeedback(
        ok ? 'Backup importado com sucesso.' : 'Arquivo JSON inválido.'
      );
      setTimeout(() => setImportFeedback(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200 px-4 py-5">
      <div className="space-y-6">
        {/* Brand Wordmark */}
        <div className="flex items-center justify-between px-2">
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Controle Rafael
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fechar menu"
            className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Month Selector */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onSelectMonth(shiftMonthKey(selectedMonth, -1))}
              aria-label="Mês anterior"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
              {formatMonthLabel(selectedMonth)}
            </span>
            <button
              type="button"
              onClick={() => onSelectMonth(shiftMonthKey(selectedMonth, 1))}
              aria-label="Próximo mês"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => onSelectMonth(currentMonthKey)}
              className="mt-2 w-full rounded-md py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
            >
              Ir para o mês atual
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Data Tools & Reset */}
      <div className="space-y-2 border-t border-slate-200 pt-4">
        <p className="px-2 text-xs font-medium text-slate-500">
          Seus dados ficam salvos neste navegador
        </p>

        <div className="space-y-1">
          <button
            type="button"
            onClick={onExportCSV}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>Exportar mês (CSV)</span>
          </button>

          <button
            type="button"
            onClick={onExportJSON}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>Salvar backup (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Upload className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>Restaurar backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {!isDemoMode && (
            <button
              type="button"
              onClick={onLoadDemo}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span>Carregar mês de exemplo</span>
            </button>
          )}
        </div>

        {importFeedback && (
          <p className="px-2 text-xs font-medium text-teal-700">
            {importFeedback}
          </p>
        )}

        <div className="pt-1 space-y-1">
          {confirmMode === null ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmMode('month')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  Zerar {formatMonthLabel(selectedMonth)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmMode('all')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>Começar do zero</span>
              </button>
            </>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 space-y-2">
              <p className="text-xs font-medium text-red-800 leading-snug">
                {confirmMode === 'month'
                  ? `Zerar os lançamentos de ${formatMonthLabel(selectedMonth)}? Seus recorrentes continuam salvos.`
                  : 'Zerar lançamentos de todos os meses? Seus recorrentes continuam salvos.'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirmMode === 'month') {
                      onClearMonth();
                    } else {
                      onClearAll();
                    }
                    setConfirmMode(null);
                  }}
                  className="flex-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmMode(null)}
                  className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-[260px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[272px] max-w-[85vw] h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
