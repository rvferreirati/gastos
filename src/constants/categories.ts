import { CategoryDefinition, RecurringItem, Transaction } from '../types/finance';
import { getCurrentMonthKey, shiftMonthKey } from '../utils/formatters';

export const EXPENSE_CATEGORIES: CategoryDefinition[] = [
  { id: 'moradia', label: 'Moradia e Contas', type: 'expense', color: '#0F766E' },
  { id: 'alimentacao', label: 'Alimentação e Mercado', type: 'expense', color: '#0284C7' },
  { id: 'transporte', label: 'Transporte', type: 'expense', color: '#475569' },
  { id: 'saude', label: 'Saúde e Farmácia', type: 'expense', color: '#059669' },
  { id: 'lazer', label: 'Lazer e Assinaturas', type: 'expense', color: '#D97706' },
  { id: 'educacao', label: 'Educação', type: 'expense', color: '#4F46E5' },
  { id: 'compras', label: 'Compras e Vestuário', type: 'expense', color: '#DB2777' },
  { id: 'outros_gastos', label: 'Outros Gastos', type: 'expense', color: '#64748B' },
];

export const INCOME_CATEGORIES: CategoryDefinition[] = [
  { id: 'salario', label: 'Salário', type: 'income', color: '#16A34A' },
  { id: 'freelance', label: 'Freelance e Extras', type: 'income', color: '#0D9488' },
  { id: 'rendimentos', label: 'Rendimentos', type: 'income', color: '#0284C7' },
  { id: 'beneficios', label: 'Vale e Benefícios', type: 'income', color: '#475569' },
  { id: 'outros_ganhos', label: 'Outros Ganhos', type: 'income', color: '#64748B' },
];

export const ALL_CATEGORIES: CategoryDefinition[] = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
];

export function getCategoryById(id: string): CategoryDefinition {
  return (
    ALL_CATEGORIES.find((cat) => cat.id === id) ?? {
      id,
      label: 'Outros',
      type: 'expense',
      color: '#64748B',
    }
  );
}

export function buildDemoTransactions(): Transaction[] {
  const currentMonth = getCurrentMonthKey();
  const prevMonth1 = shiftMonthKey(currentMonth, -1);
  const prevMonth2 = shiftMonthKey(currentMonth, -2);

  const makeDate = (monthKey: string, day: number) =>
    `${monthKey}-${String(day).padStart(2, '0')}`;

  const now = Date.now();

  return [
    // Current month
    {
      id: 'demo-cur-1',
      type: 'income',
      description: 'Salário mensal líquido',
      amount: 5400,
      category: 'salario',
      date: makeDate(currentMonth, 5),
      monthKey: currentMonth,
      recurring: true,
      createdAt: now - 140000,
    },
    {
      id: 'demo-cur-2',
      type: 'income',
      description: 'Projeto de consultoria pontual',
      amount: 950,
      category: 'freelance',
      date: makeDate(currentMonth, 12),
      monthKey: currentMonth,
      recurring: false,
      createdAt: now - 130000,
    },
    {
      id: 'demo-cur-3',
      type: 'expense',
      description: 'Aluguel e condomínio',
      amount: 1850,
      category: 'moradia',
      date: makeDate(currentMonth, 6),
      monthKey: currentMonth,
      recurring: true,
      createdAt: now - 120000,
    },
    {
      id: 'demo-cur-4',
      type: 'expense',
      description: 'Energia elétrica e internet fibra',
      amount: 278.9,
      category: 'moradia',
      date: makeDate(currentMonth, 8),
      monthKey: currentMonth,
      recurring: true,
      createdAt: now - 110000,
    },
    {
      id: 'demo-cur-5',
      type: 'expense',
      description: 'Supermercado da semana',
      amount: 642.5,
      category: 'alimentacao',
      date: makeDate(currentMonth, 9),
      monthKey: currentMonth,
      recurring: false,
      createdAt: now - 100000,
    },
    {
      id: 'demo-cur-6',
      type: 'expense',
      description: 'Combustível e estacionamento',
      amount: 310,
      category: 'transporte',
      date: makeDate(currentMonth, 11),
      monthKey: currentMonth,
      recurring: false,
      createdAt: now - 90000,
    },
    {
      id: 'demo-cur-7',
      type: 'expense',
      description: 'Farmácia e vitaminas',
      amount: 134.8,
      category: 'saude',
      date: makeDate(currentMonth, 13),
      monthKey: currentMonth,
      recurring: false,
      createdAt: now - 80000,
    },
    {
      id: 'demo-cur-8',
      type: 'expense',
      description: 'Streaming e música',
      amount: 79.8,
      category: 'lazer',
      date: makeDate(currentMonth, 14),
      monthKey: currentMonth,
      recurring: true,
      createdAt: now - 70000,
    },
    {
      id: 'demo-cur-9',
      type: 'expense',
      description: 'Almoço e feira de domingo',
      amount: 196.4,
      category: 'alimentacao',
      date: makeDate(currentMonth, 16),
      monthKey: currentMonth,
      recurring: false,
      createdAt: now - 60000,
    },
    {
      id: 'demo-cur-10',
      type: 'expense',
      description: 'Curso de inglês online',
      amount: 240,
      category: 'educacao',
      date: makeDate(currentMonth, 17),
      monthKey: currentMonth,
      recurring: true,
      createdAt: now - 50000,
    },

    // Previous month 1
    {
      id: 'demo-p1-1',
      type: 'income',
      description: 'Salário mensal líquido',
      amount: 5400,
      category: 'salario',
      date: makeDate(prevMonth1, 5),
      monthKey: prevMonth1,
      recurring: true,
      createdAt: now - 240000,
    },
    {
      id: 'demo-p1-2',
      type: 'expense',
      description: 'Aluguel e condomínio',
      amount: 1850,
      category: 'moradia',
      date: makeDate(prevMonth1, 6),
      monthKey: prevMonth1,
      recurring: true,
      createdAt: now - 230000,
    },
    {
      id: 'demo-p1-3',
      type: 'expense',
      description: 'Energia e internet',
      amount: 295,
      category: 'moradia',
      date: makeDate(prevMonth1, 8),
      monthKey: prevMonth1,
      recurring: true,
      createdAt: now - 220000,
    },
    {
      id: 'demo-p1-4',
      type: 'expense',
      description: 'Compras de mercado do mês',
      amount: 1120,
      category: 'alimentacao',
      date: makeDate(prevMonth1, 14),
      monthKey: prevMonth1,
      recurring: false,
      createdAt: now - 210000,
    },
    {
      id: 'demo-p1-5',
      type: 'expense',
      description: 'Revisão do carro',
      amount: 680,
      category: 'transporte',
      date: makeDate(prevMonth1, 19),
      monthKey: prevMonth1,
      recurring: false,
      createdAt: now - 200000,
    },
    {
      id: 'demo-p1-6',
      type: 'expense',
      description: 'Jantar e cinema',
      amount: 245,
      category: 'lazer',
      date: makeDate(prevMonth1, 24),
      monthKey: prevMonth1,
      recurring: false,
      createdAt: now - 190000,
    },

    // Previous month 2
    {
      id: 'demo-p2-1',
      type: 'income',
      description: 'Salário mensal líquido',
      amount: 5100,
      category: 'salario',
      date: makeDate(prevMonth2, 5),
      monthKey: prevMonth2,
      recurring: true,
      createdAt: now - 340000,
    },
    {
      id: 'demo-p2-2',
      type: 'income',
      description: 'Rendimento poupança e CDB',
      amount: 185,
      category: 'rendimentos',
      date: makeDate(prevMonth2, 15),
      monthKey: prevMonth2,
      recurring: false,
      createdAt: now - 330000,
    },
    {
      id: 'demo-p2-3',
      type: 'expense',
      description: 'Aluguel e condomínio',
      amount: 1850,
      category: 'moradia',
      date: makeDate(prevMonth2, 6),
      monthKey: prevMonth2,
      recurring: true,
      createdAt: now - 320000,
    },
    {
      id: 'demo-p2-4',
      type: 'expense',
      description: 'Mercado e padaria',
      amount: 980,
      category: 'alimentacao',
      date: makeDate(prevMonth2, 12),
      monthKey: prevMonth2,
      recurring: false,
      createdAt: now - 310000,
    },
    {
      id: 'demo-p2-5',
      type: 'expense',
      description: 'Roupas e tênis',
      amount: 590,
      category: 'compras',
      date: makeDate(prevMonth2, 21),
      monthKey: prevMonth2,
      recurring: false,
      createdAt: now - 300000,
    },
    {
      id: 'demo-p2-6',
      type: 'expense',
      description: 'Transporte e aplicativo',
      amount: 280,
      category: 'transporte',
      date: makeDate(prevMonth2, 26),
      monthKey: prevMonth2,
      recurring: false,
      createdAt: now - 290000,
    },
  ];
}

export function buildDemoRecurringItems(): RecurringItem[] {
  const now = Date.now();
  return [
    {
      id: 'rec-demo-1',
      type: 'expense',
      description: 'Aluguel e condomínio',
      amount: 1850,
      category: 'moradia',
      dayOfMonth: 6,
      active: true,
      createdAt: now - 50000,
    },
    {
      id: 'rec-demo-2',
      type: 'expense',
      description: 'Energia elétrica e internet fibra',
      amount: 278.9,
      category: 'moradia',
      dayOfMonth: 8,
      active: true,
      createdAt: now - 40000,
    },
    {
      id: 'rec-demo-3',
      type: 'expense',
      description: 'Streaming e música',
      amount: 79.8,
      category: 'lazer',
      dayOfMonth: 14,
      active: true,
      createdAt: now - 30000,
    },
    {
      id: 'rec-demo-4',
      type: 'expense',
      description: 'Curso de inglês online',
      amount: 240,
      category: 'educacao',
      dayOfMonth: 17,
      active: true,
      createdAt: now - 20000,
    },
    {
      id: 'rec-demo-5',
      type: 'income',
      description: 'Salário mensal líquido',
      amount: 5400,
      category: 'salario',
      dayOfMonth: 5,
      active: true,
      createdAt: now - 10000,
    },
  ];
}

