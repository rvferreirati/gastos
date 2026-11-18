import { useState } from 'react';
import { Repeat, Undo2, X } from 'lucide-react';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { MonthlyComparison } from './components/MonthlyComparison';
import { QuickEntryForm } from './components/QuickEntryForm';
import { RecurringMonthCard } from './components/RecurringMonthCard';
import { RecurringView } from './components/RecurringView';
import { Sidebar } from './components/Sidebar';
import { SummaryStrip } from './components/SummaryStrip';
import { TopBar } from './components/TopBar';
import { TransactionLedger } from './components/TransactionLedger';
import { TransactionModal } from './components/TransactionModal';
import { useFinanceStore } from './hooks/useFinanceStore';
import { Transaction, TransactionType, ViewMode } from './types/finance';
import { exportTransactionsToCSV, formatBRL, formatMonthLabel } from './utils/formatters';

export default function App() {
  const {
    transactions,
    recurringItems,
    monthTransactions,
    monthSummary,
    categoryBreakdown,
    incomeEntries,
    monthlyHistory,
    selectedMonth,
    setSelectedMonth,
    isDemoMode,
    lastDeleted,
    previousMonthRecurringCount,
    pendingRecurringCount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    undoDelete,
    dismissUndo,
    clearAllTransactions,
    clearMonthTransactions,
    loadDemoData,
    copyRecurringFromPreviousMonth,
    importFromJSON,
    isRecurringAppliedInMonth,
    addRecurringItem,
    updateRecurringItem,
    toggleRecurringItemActive,
    deleteRecurringItem,
    applyRecurringItemToMonth,
    applyAllActiveRecurringToMonth,
  } = useFinanceStore();

  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleOpenNewModal = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setModalInitialType(type);
    setModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setModalInitialType(tx.type);
    setModalOpen(true);
  };

  const handleSelectMonth = (monthKey: string) => {
    setSelectedMonth(monthKey);
    setSelectedCategoryFilter('all');
    setCopyFeedback(null);
  };

  const handleCopyRecurring = () => {
    const added = copyRecurringFromPreviousMonth(selectedMonth);
    if (added > 0) {
      setCopyFeedback(
        `${added} ${added === 1 ? 'lançamento fixo copiado' : 'lançamentos fixos copiados'} para ${formatMonthLabel(selectedMonth)}.`
      );
    } else {
      setCopyFeedback('Todos os lançamentos fixos do mês anterior já estão neste mês.');
    }
    setTimeout(() => setCopyFeedback(null), 4000);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(monthTransactions, formatMonthLabel(selectedMonth));
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `controle-rafael-backup-${selectedMonth}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        selectedMonth={selectedMonth}
        onSelectMonth={handleSelectMonth}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onImportJSON={importFromJSON}
        onClearMonth={() => clearMonthTransactions(selectedMonth)}
        onClearAll={clearAllTransactions}
        onLoadDemo={loadDemoData}
        isDemoMode={isDemoMode}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeView={activeView}
          selectedMonth={selectedMonth}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewModal={() => handleOpenNewModal('expense')}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1320px] w-full mx-auto space-y-6">
          {/* Demo Mode Notice */}
          {isDemoMode && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs">
              <p className="text-slate-600">
                Você está vendo um mês preenchido de exemplo. Edite os valores livremente ou zere os lançamentos mantendo seus recorrentes salvos.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => clearMonthTransactions(selectedMonth)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Zerar {formatMonthLabel(selectedMonth)}
                </button>
                <button
                  type="button"
                  onClick={clearAllTransactions}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Começar do zero
                </button>
              </div>
            </div>
          )}

          {/* Recurring Templates Pending Banner */}
          {pendingRecurringCount > 0 && activeView !== 'recurring' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-xs">
              <div className="flex items-center gap-2 text-teal-900">
                <Repeat className="h-4 w-4 shrink-0 text-teal-700" />
                <span>
                  Você tem {pendingRecurringCount}{' '}
                  {pendingRecurringCount === 1
                    ? 'lançamento recorrente cadastrado que ainda não foi lançado'
                    : 'lançamentos recorrentes cadastrados que ainda não foram lançados'}{' '}
                  em {formatMonthLabel(selectedMonth)}.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('recurring')}
                  className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 font-medium text-teal-800 hover:bg-teal-50 transition-colors whitespace-nowrap shrink-0"
                >
                  Ver recorrentes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const added = applyAllActiveRecurringToMonth(selectedMonth);
                    if (added > 0) {
                      setCopyFeedback(
                        `${added} ${added === 1 ? 'recorrente aplicado' : 'recorrentes aplicados'} em ${formatMonthLabel(selectedMonth)}.`
                      );
                      setTimeout(() => setCopyFeedback(null), 4000);
                    }
                  }}
                  className="rounded-lg bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Lançar todos no mês
                </button>
              </div>
            </div>
          )}

          {/* Recurring Carry-Over Banner (when previous month has fixed items and no templates pending) */}
          {pendingRecurringCount === 0 &&
            previousMonthRecurringCount > 0 &&
            monthTransactions.length === 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-teal-900">
                  <Repeat className="h-4 w-4 shrink-0 text-teal-700" />
                  <span>
                    Existem {previousMonthRecurringCount}{' '}
                    {previousMonthRecurringCount === 1
                      ? 'lançamento fixo'
                      : 'lançamentos fixos'}{' '}
                    no mês anterior. Deseja copiar para{' '}
                    {formatMonthLabel(selectedMonth)}?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRecurring}
                  className="rounded-lg bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Copiar fixos para este mês
                </button>
              </div>
            )}

          {copyFeedback && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-medium text-teal-800">
              {copyFeedback}
            </div>
          )}

          {/* View Switcher */}
          {activeView === 'overview' && (
            <>
              <SummaryStrip
                totalIncome={monthSummary.totalIncome}
                totalExpense={monthSummary.totalExpense}
                balance={monthSummary.balance}
                commitmentRate={monthSummary.commitmentRate}
                savingsRate={monthSummary.savingsRate}
                incomeCount={monthSummary.incomeCount}
                expenseCount={monthSummary.expenseCount}
                selectedMonth={selectedMonth}
                onQuickAddIncome={() => handleOpenNewModal('income')}
              />

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-8 space-y-6">
                  <QuickEntryForm
                    selectedMonth={selectedMonth}
                    onAdd={addTransaction}
                  />

                  <TransactionLedger
                    transactions={monthTransactions}
                    onEdit={handleEditTransaction}
                    onDelete={deleteTransaction}
                    selectedCategoryFilter={selectedCategoryFilter}
                    onChangeCategoryFilter={setSelectedCategoryFilter}
                    previousMonthRecurringCount={previousMonthRecurringCount}
                    onCopyRecurring={handleCopyRecurring}
                    onQuickAddIncome={() => handleOpenNewModal('income')}
                    onQuickAddExpense={() => handleOpenNewModal('expense')}
                  />
                </div>

                <div className="xl:col-span-4 space-y-6">
                  <RecurringMonthCard
                    recurringItems={recurringItems}
                    selectedMonth={selectedMonth}
                    isAppliedInMonth={isRecurringAppliedInMonth}
                    onApplyOneToMonth={(item) =>
                      applyRecurringItemToMonth(item, selectedMonth)
                    }
                    onApplyAllPendingToMonth={() =>
                      applyAllActiveRecurringToMonth(selectedMonth)
                    }
                    onOpenRecurringTab={() => setActiveView('recurring')}
                  />

                  <CategoryBreakdown
                    categories={categoryBreakdown}
                    incomeEntries={incomeEntries}
                    totalIncome={monthSummary.totalIncome}
                    totalExpense={monthSummary.totalExpense}
                    selectedCategoryFilter={selectedCategoryFilter}
                    onSelectCategory={setSelectedCategoryFilter}
                    onAddIncome={() => handleOpenNewModal('income')}
                    onEditTransaction={handleEditTransaction}
                  />
                </div>
              </div>
            </>
          )}

          {activeView === 'ledger' && (
            <>
              <SummaryStrip
                totalIncome={monthSummary.totalIncome}
                totalExpense={monthSummary.totalExpense}
                balance={monthSummary.balance}
                commitmentRate={monthSummary.commitmentRate}
                savingsRate={monthSummary.savingsRate}
                incomeCount={monthSummary.incomeCount}
                expenseCount={monthSummary.expenseCount}
                selectedMonth={selectedMonth}
                onQuickAddIncome={() => handleOpenNewModal('income')}
              />

              <QuickEntryForm
                selectedMonth={selectedMonth}
                onAdd={addTransaction}
              />

              <TransactionLedger
                transactions={monthTransactions}
                onEdit={handleEditTransaction}
                onDelete={deleteTransaction}
                selectedCategoryFilter={selectedCategoryFilter}
                onChangeCategoryFilter={setSelectedCategoryFilter}
                previousMonthRecurringCount={previousMonthRecurringCount}
                onCopyRecurring={handleCopyRecurring}
                onQuickAddIncome={() => handleOpenNewModal('income')}
                onQuickAddExpense={() => handleOpenNewModal('expense')}
                title={`Todos os lançamentos de ${formatMonthLabel(selectedMonth)}`}
              />
            </>
          )}

          {activeView === 'recurring' && (
            <>
              <SummaryStrip
                totalIncome={monthSummary.totalIncome}
                totalExpense={monthSummary.totalExpense}
                balance={monthSummary.balance}
                commitmentRate={monthSummary.commitmentRate}
                savingsRate={monthSummary.savingsRate}
                incomeCount={monthSummary.incomeCount}
                expenseCount={monthSummary.expenseCount}
                selectedMonth={selectedMonth}
                onQuickAddIncome={() => handleOpenNewModal('income')}
              />

              <RecurringView
                recurringItems={recurringItems}
                selectedMonth={selectedMonth}
                totalIncome={monthSummary.totalIncome}
                currentBalance={monthSummary.balance}
                isAppliedInMonth={isRecurringAppliedInMonth}
                onAddRecurring={addRecurringItem}
                onUpdateRecurring={updateRecurringItem}
                onToggleActive={toggleRecurringItemActive}
                onDeleteRecurring={deleteRecurringItem}
                onApplyOneToMonth={(item) =>
                  applyRecurringItemToMonth(item, selectedMonth)
                }
                onApplyAllPendingToMonth={() =>
                  applyAllActiveRecurringToMonth(selectedMonth)
                }
                onGoToOverview={() => setActiveView('overview')}
              />
            </>
          )}

          {activeView === 'categories' && (
            <>
              <SummaryStrip
                totalIncome={monthSummary.totalIncome}
                totalExpense={monthSummary.totalExpense}
                balance={monthSummary.balance}
                commitmentRate={monthSummary.commitmentRate}
                savingsRate={monthSummary.savingsRate}
                incomeCount={monthSummary.incomeCount}
                expenseCount={monthSummary.expenseCount}
                selectedMonth={selectedMonth}
                onQuickAddIncome={() => handleOpenNewModal('income')}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5">
                  <CategoryBreakdown
                    categories={categoryBreakdown}
                    incomeEntries={incomeEntries}
                    totalIncome={monthSummary.totalIncome}
                    totalExpense={monthSummary.totalExpense}
                    selectedCategoryFilter={selectedCategoryFilter}
                    onSelectCategory={setSelectedCategoryFilter}
                    onAddIncome={() => handleOpenNewModal('income')}
                    onEditTransaction={handleEditTransaction}
                  />
                </div>

                <div className="lg:col-span-7">
                  <TransactionLedger
                    transactions={monthTransactions}
                    onEdit={handleEditTransaction}
                    onDelete={deleteTransaction}
                    selectedCategoryFilter={selectedCategoryFilter}
                    onChangeCategoryFilter={setSelectedCategoryFilter}
                    previousMonthRecurringCount={previousMonthRecurringCount}
                    onCopyRecurring={handleCopyRecurring}
                    onQuickAddIncome={() => handleOpenNewModal('income')}
                    onQuickAddExpense={() => handleOpenNewModal('expense')}
                    title={
                      selectedCategoryFilter === 'all'
                        ? 'Lançamentos por categoria'
                        : 'Lançamentos da categoria selecionada'
                    }
                  />
                </div>
              </div>
            </>
          )}

          {activeView === 'comparison' && (
            <MonthlyComparison
              history={monthlyHistory}
              selectedMonth={selectedMonth}
              onSelectMonth={(mKey) => {
                handleSelectMonth(mKey);
                setActiveView('overview');
              }}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTx(null);
        }}
        selectedMonth={selectedMonth}
        initialType={modalInitialType}
        editingTransaction={editingTx}
        onSaveNew={addTransaction}
        onSaveEdit={updateTransaction}
      />

      {/* Undo Delete Toast */}
      {lastDeleted && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs text-white shadow-lg"
        >
          <span>
            Removido: <strong>{lastDeleted.description}</strong> (
            {formatBRL(lastDeleted.amount)})
          </span>
          <button
            type="button"
            onClick={undoDelete}
            className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1 font-medium text-white hover:bg-teal-500 transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Desfazer</span>
          </button>
          <button
            type="button"
            onClick={dismissUndo}
            aria-label="Fechar aviso"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
