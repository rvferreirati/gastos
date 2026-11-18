import { Transaction } from '../types/finance';
import { getCategoryById } from '../constants/categories';

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const SHORT_MONTH_NAMES = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

export function formatBRL(value: number): string {
  return brlFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(Number.isFinite(value) ? value : 0)}%`;
}

export function parseCurrencyInput(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, '').trim();
  if (!cleaned) return 0;

  // Handle Brazilian format (1.234,56) vs US dot format (1234.56)
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  let normalized = cleaned;
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  } else if (hasDot) {
    // If dot has 3 trailing digits like 1.500, treat as thousands separator
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      normalized = parts.join('');
    }
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) / 100 : 0;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayDateForMonth(monthKey: string): string {
  const currentMonth = getCurrentMonthKey();
  const now = new Date();
  if (monthKey === currentMonth) {
    const day = String(now.getDate()).padStart(2, '0');
    return `${monthKey}-${day}`;
  }
  return `${monthKey}-01`;
}

export function shiftMonthKey(monthKey: string, deltaMonths: number): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number.parseInt(yearStr, 10);
  const monthIndex = Number.parseInt(monthStr, 10) - 1;
  const date = new Date(year, monthIndex + deltaMonths, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIndex = Number.parseInt(monthStr, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex] ?? monthStr;
  return `${monthName} ${yearStr}`;
}

export function formatShortMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIndex = Number.parseInt(monthStr, 10) - 1;
  const shortName = SHORT_MONTH_NAMES[monthIndex] ?? monthStr;
  return `${shortName}/${yearStr.slice(2)}`;
}

export function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parts[2];
  const monthIndex = Number.parseInt(parts[1], 10) - 1;
  const shortMonth = SHORT_MONTH_NAMES[monthIndex] ?? parts[1];
  return `${day} ${shortMonth}`;
}

export function getDaysInfoInMonth(monthKey: string): {
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
} {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number.parseInt(yearStr, 10);
  const monthIndex = Number.parseInt(monthStr, 10) - 1;
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  const currentMonth = getCurrentMonthKey();
  if (monthKey < currentMonth) {
    return { totalDays, elapsedDays: totalDays, remainingDays: 0 };
  }
  if (monthKey > currentMonth) {
    return { totalDays, elapsedDays: 0, remainingDays: totalDays };
  }
  const today = new Date().getDate();
  const elapsedDays = Math.min(today, totalDays);
  return {
    totalDays,
    elapsedDays,
    remainingDays: Math.max(totalDays - elapsedDays, 0),
  };
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  monthLabel: string
): void {
  const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor (BRL)', 'Fixo Mensal'];
  const rows = transactions.map((t) => {
    const categoryLabel = getCategoryById(t.category).label;
    const typeLabel = t.type === 'income' ? 'Ganho' : 'Gasto';
    const escapedDesc = `"${t.description.replace(/"/g, '""')}"`;
    const amountStr = t.amount.toFixed(2).replace('.', ',');
    return [
      t.date,
      typeLabel,
      escapedDesc,
      `"${categoryLabel}"`,
      amountStr,
      t.recurring ? 'Sim' : 'Não',
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `controle-rafael-${monthLabel.toLowerCase().replace(/\s+/g, '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
