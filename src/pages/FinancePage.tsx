import { useState, useEffect, useCallback } from 'react'
import { Wallet, TrendingUp, TrendingDown, Plus, PiggyBank, CreditCard, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'

import { IncomeModal } from '@/components/forms/IncomeModal'
import { ExpenseModal } from '@/components/forms/ExpenseModal'
import { AccountModal } from '@/components/forms/AccountModal'
import { BudgetModal } from '@/components/forms/BudgetModal'

import { getFinancialOverview, type Account, type Income, type Expense, type Budget } from '@/services/financeService'

type TabId = 'overview' | 'income' | 'expenses' | 'budgets' | 'accounts'

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Overview State
  const [totalBalance, setTotalBalance] = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [savingsRate, setSavingsRate] = useState(0)

  // Items State
  const [accounts, setAccounts] = useState<Account[]>([])
  const [incomeLogs, setIncomeLogs] = useState<Income[]>([])
  const [expenseLogs, setExpenseLogs] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])

  // Modal States
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)

  const loadFinanceData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getFinancialOverview()
      setTotalBalance(data.totalBalance)
      setMonthlyIncome(data.monthlyIncome)
      setMonthlyExpenses(data.monthlyExpenses)
      setSavingsRate(data.savingsRate)

      setAccounts(data.accounts)
      setIncomeLogs(data.incomeLogs)
      setExpenseLogs(data.expenseLogs)
      setBudgets(data.budgets)
    } catch (err) {
      console.error('Failed to load financial data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFinanceData()
  }, [loadFinanceData])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'income', label: 'Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'accounts', label: 'Accounts' },
  ] as const

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#26352e] dark:text-[#f3f7f3] tracking-tight">Your Money</h1>
          <p className="text-sm text-[#718078] dark:text-[#a8bdaf]">
            Accounts, income logging, expense budgets, and savings progress
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'income' && (
            <Button onClick={() => setIsIncomeModalOpen(true)} icon={<Plus size={18} />}>Log Income</Button>
          )}
          {activeTab === 'expenses' && (
            <Button onClick={() => setIsExpenseModalOpen(true)} icon={<Plus size={18} />}>Log Expense</Button>
          )}
          {activeTab === 'accounts' && (
            <Button onClick={() => setIsAccountModalOpen(true)} icon={<Plus size={18} />}>Add Account</Button>
          )}
          {activeTab === 'budgets' && (
            <Button onClick={() => setIsBudgetModalOpen(true)} icon={<Plus size={18} />}>Set Budget</Button>
          )}
          {activeTab === 'overview' && (
            <div className="flex gap-2">
              <Button onClick={() => setIsIncomeModalOpen(true)} icon={<Plus size={18} />}>Income</Button>
              <Button onClick={() => setIsExpenseModalOpen(true)} icon={<Plus size={18} />}>Expense</Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#315c4a] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1c2722] text-[#718078] dark:text-[#a8bdaf] hover:bg-[#e8f0ea] border border-[#dce5de] dark:border-[#26352e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading financial records...</div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-700 dark:text-emerald-300">
                      <Wallet size={20} />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Total Balance</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg text-blue-700 dark:text-blue-300">
                      <TrendingUp size={20} />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Monthly Income</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    ${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg text-red-700 dark:text-red-300">
                      <TrendingDown size={20} />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Monthly Expenses</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    ${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg text-purple-700 dark:text-purple-300">
                      <PiggyBank size={20} />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Savings Rate</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {savingsRate}%
                  </div>
                </Card>
              </div>

              {/* Accounts Summary Row */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Accounts Overview</h3>
                {accounts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accounts.map((acc) => (
                      <Card key={acc.id} className="p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            {acc.account_type}
                          </span>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{acc.name}</h4>
                          {acc.institution_name && (
                            <p className="text-xs text-gray-500">{acc.institution_name}</p>
                          )}
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          ${(acc.current_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center text-sm text-gray-500">
                    No accounts added. Click "Add Account" to track checking or savings balances.
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INCOME */}
          {activeTab === 'income' && (
            <div className="space-y-4">
              {incomeLogs.length > 0 ? (
                <div className="space-y-3">
                  {incomeLogs.map((inc) => (
                    <Card key={inc.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{inc.source}</h4>
                          <p className="text-xs text-gray-500">
                            {inc.date} · Category: {inc.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        +${inc.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No income records logged.</Card>
              )}
            </div>
          )}

          {/* TAB 3: EXPENSES */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {expenseLogs.length > 0 ? (
                <div className="space-y-3">
                  {expenseLogs.map((exp) => (
                    <Card key={exp.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{exp.merchant}</h4>
                          <p className="text-xs text-gray-500">
                            {exp.date} · {exp.category} {exp.recurring ? '(Recurring)' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        -${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No expense records logged.</Card>
              )}
            </div>
          )}

          {/* TAB 4: BUDGETS */}
          {activeTab === 'budgets' && (
            <div className="space-y-4">
              {budgets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {budgets.map((b: Budget) => {
                    const spent = expenseLogs
                      .filter((e) => e.category === b.category)
                      .reduce((sum, e) => sum + e.amount, 0)

                    const percent = Math.min(100, Math.round((spent / b.monthly_amount) * 100))

                    return (
                      <Card key={b.id} className="p-5">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{b.category}</h4>
                          <span className="text-xs font-bold text-gray-500">
                            ${spent} / ${b.monthly_amount}
                          </span>
                        </div>
                        <ProgressBar value={percent} />
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No category budgets configured.</Card>
              )}
            </div>
          )}

          {/* TAB 5: ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <Card key={acc.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {acc.account_type}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{acc.name}</h4>
                        {acc.institution_name && (
                          <p className="text-xs text-gray-500">{acc.institution_name}</p>
                        )}
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ${(acc.current_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-sm text-gray-500">No accounts created.</Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Creation Modals */}
      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} onIncomeLogged={loadFinanceData} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onExpenseLogged={loadFinanceData} />
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onAccountSaved={loadFinanceData} />
      <BudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} onBudgetSaved={loadFinanceData} />
    </div>
  )
}
