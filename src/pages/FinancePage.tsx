import { useState, useEffect, useCallback } from 'react'
import { Wallet, TrendingUp, TrendingDown, Plus, PiggyBank, CreditCard, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'

import { IncomeModal }  from '@/components/forms/IncomeModal'
import { ExpenseModal } from '@/components/forms/ExpenseModal'
import { AccountModal } from '@/components/forms/AccountModal'
import { BudgetModal }  from '@/components/forms/BudgetModal'

import { getFinancialOverview, type Account, type Income, type Expense, type Budget } from '@/services/financeService'

type TabId = 'overview' | 'income' | 'expenses' | 'budgets' | 'accounts'

const TAB_ACTIVE   = 'bg-[#5e6544] text-white border-[#5e6544]'
const TAB_INACTIVE = 'bg-white text-[#8c947d] hover:bg-[#dfe8db] border-[#c4cfbc]'

// Icon bg tones — all sage-green family
const STAT_ICONS = [
  { icon: Wallet,     label: 'Total Balance',    bg: 'bg-[#dfe8db] text-[#5e6544]' },
  { icon: TrendingUp, label: 'Monthly Income',   bg: 'bg-[#b7c3a1]/30 text-[#5e6544]' },
  { icon: TrendingDown,label:'Monthly Expenses', bg: 'bg-[#a85d48]/10 text-[#a85d48]' },
  { icon: PiggyBank,  label: 'Savings Rate',     bg: 'bg-[#c4cfbc]/50 text-[#8c947d]' },
]

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isLoading, setIsLoading] = useState(true)

  const [totalBalance,    setTotalBalance]    = useState(0)
  const [monthlyIncome,   setMonthlyIncome]   = useState(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [savingsRate,     setSavingsRate]     = useState(0)

  const [accounts,    setAccounts]    = useState<Account[]>([])
  const [incomeLogs,  setIncomeLogs]  = useState<Income[]>([])
  const [expenseLogs, setExpenseLogs] = useState<Expense[]>([])
  const [budgets,     setBudgets]     = useState<Budget[]>([])

  const [isIncomeModalOpen,  setIsIncomeModalOpen]  = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isBudgetModalOpen,  setIsBudgetModalOpen]  = useState(false)

  const loadFinanceData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getFinancialOverview()
      setTotalBalance(data.totalBalance);   setMonthlyIncome(data.monthlyIncome)
      setMonthlyExpenses(data.monthlyExpenses); setSavingsRate(data.savingsRate)
      setAccounts(data.accounts); setIncomeLogs(data.incomeLogs)
      setExpenseLogs(data.expenseLogs); setBudgets(data.budgets)
    } catch (err) {
      console.error('Failed to load financial data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadFinanceData() }, [loadFinanceData])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'income',   label: 'Income'   },
    { id: 'expenses', label: 'Expenses' },
    { id: 'budgets',  label: 'Budgets'  },
    { id: 'accounts', label: 'Accounts' },
  ] as const

  const emptyCard = (msg: string) => (
    <div className="bg-white rounded-2xl border border-[#c4cfbc] p-8 text-center text-sm text-[#8c947d]">{msg}</div>
  )

  const statValues = [
    `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `$${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `$${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `${savingsRate}%`,
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#c4cfbc]">
        <div>
          <h1 className="text-2xl font-black text-[#2e2f22] tracking-tight">Your Money</h1>
          <p className="text-sm text-[#8c947d] mt-0.5">Accounts, income, expenses, budgets & savings</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'income'   && <Button variant="secondary" onClick={() => setIsIncomeModalOpen(true)}  icon={<Plus size={16}/>}>Log Income</Button>}
          {activeTab === 'expenses' && <Button variant="secondary" onClick={() => setIsExpenseModalOpen(true)} icon={<Plus size={16}/>}>Log Expense</Button>}
          {activeTab === 'accounts' && <Button variant="secondary" onClick={() => setIsAccountModalOpen(true)} icon={<Plus size={16}/>}>Add Account</Button>}
          {activeTab === 'budgets'  && <Button variant="secondary" onClick={() => setIsBudgetModalOpen(true)}  icon={<Plus size={16}/>}>Set Budget</Button>}
          {activeTab === 'overview' && (
            <>
              <Button variant="secondary" onClick={() => setIsIncomeModalOpen(true)}  icon={<Plus size={16}/>}>Income</Button>
              <Button variant="secondary" onClick={() => setIsExpenseModalOpen(true)} icon={<Plus size={16}/>}>Expense</Button>
            </>
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeTab === tab.id ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#8c947d] text-sm">Loading financial records…</div>
      ) : (
        <>
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_ICONS.map(({ icon: Icon, label, bg }, i) => (
                  <div key={label} className="bg-white rounded-2xl border border-[#c4cfbc] p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl ${bg}`}><Icon size={18} /></div>
                      <h3 className="font-semibold text-[10px] text-[#8c947d] uppercase tracking-wider">{label}</h3>
                    </div>
                    <div className="text-2xl font-black text-[#2e2f22]">{statValues[i]}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#2e2f22]">Accounts Overview</h3>
                {accounts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accounts.map((acc) => (
                      <div key={acc.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c947d]">{acc.account_type}</span>
                          <h4 className="font-semibold text-[#2e2f22]">{acc.name}</h4>
                          {acc.institution_name && <p className="text-xs text-[#8c947d]">{acc.institution_name}</p>}
                        </div>
                        <div className="text-lg font-black text-[#2e2f22]">
                          ${(acc.current_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : emptyCard('No accounts added. Click "Add Account" to track balances.')}
              </div>
            </div>
          )}

          {/* INCOME */}
          {activeTab === 'income' && (
            <div className="space-y-3">
              {incomeLogs.length > 0 ? incomeLogs.map((inc) => (
                <div key={inc.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#dfe8db] text-[#5e6544] rounded-xl"><DollarSign size={18} /></div>
                    <div>
                      <h4 className="font-semibold text-[#2e2f22]">{inc.source}</h4>
                      <p className="text-xs text-[#8c947d]">{inc.date} · {inc.category}</p>
                    </div>
                  </div>
                  <div className="text-lg font-black text-[#5e6544]">+${inc.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              )) : emptyCard('No income records logged.')}
            </div>
          )}

          {/* EXPENSES */}
          {activeTab === 'expenses' && (
            <div className="space-y-3">
              {expenseLogs.length > 0 ? expenseLogs.map((exp) => (
                <div key={exp.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#a85d48]/10 text-[#a85d48] rounded-xl"><CreditCard size={18} /></div>
                    <div>
                      <h4 className="font-semibold text-[#2e2f22]">{exp.merchant}</h4>
                      <p className="text-xs text-[#8c947d]">{exp.date} · {exp.category} {exp.recurring ? '(Recurring)' : ''}</p>
                    </div>
                  </div>
                  <div className="text-lg font-black text-[#a85d48]">-${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              )) : emptyCard('No expense records logged.')}
            </div>
          )}

          {/* BUDGETS */}
          {activeTab === 'budgets' && (
            <div className="space-y-4">
              {budgets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {budgets.map((b: Budget) => {
                    const spent   = expenseLogs.filter((e) => e.category === b.category).reduce((sum, e) => sum + e.amount, 0)
                    const percent = Math.min(100, Math.round((spent / b.monthly_amount) * 100))
                    const overBudget = percent >= 90
                    return (
                      <div key={b.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-5">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-[#2e2f22] capitalize">{b.category}</h4>
                          <span className={`text-xs font-bold ${overBudget ? 'text-[#a85d48]' : 'text-[#8c947d]'}`}>
                            ${spent.toFixed(0)} / ${b.monthly_amount}
                          </span>
                        </div>
                        <ProgressBar
                          value={percent}
                          color={overBudget ? 'bg-[#a85d48]' : 'bg-[#5e6544]'}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : emptyCard('No category budgets configured.')}
            </div>
          )}

          {/* ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-3">
              {accounts.length > 0 ? accounts.map((acc) => (
                <div key={acc.id} className="bg-white rounded-2xl border border-[#c4cfbc] p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c947d]">{acc.account_type}</span>
                    <h4 className="font-semibold text-[#2e2f22]">{acc.name}</h4>
                    {acc.institution_name && <p className="text-xs text-[#8c947d]">{acc.institution_name}</p>}
                  </div>
                  <div className="text-lg font-black text-[#2e2f22]">
                    ${(acc.current_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )) : emptyCard('No accounts created.')}
            </div>
          )}
        </>
      )}

      <IncomeModal  isOpen={isIncomeModalOpen}  onClose={() => setIsIncomeModalOpen(false)}  onIncomeLogged={loadFinanceData} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onExpenseLogged={loadFinanceData} />
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onAccountSaved={loadFinanceData} />
      <BudgetModal  isOpen={isBudgetModalOpen}  onClose={() => setIsBudgetModalOpen(false)}  onBudgetSaved={loadFinanceData} />
    </div>
  )
}
