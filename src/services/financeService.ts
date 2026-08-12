// ============================================
// Personal OS — Finance Service & Paycheck Engine
// ============================================

import { supabase } from '@/lib/supabase'
import type { Tables, InsertTables } from '@/types'

export type Account = Tables<'accounts'>
export type Income = Tables<'income'>
export type Expense = Tables<'expenses'>
export type Budget = Tables<'budgets'>

// Viv's initial actual accounts
const VIV_ACCOUNTS: Account[] = [
  {
    id: 'viv-acc-checking',
    user_id: 'demo-user-id-001',
    name: 'Primary Checking',
    account_type: 'checking',
    current_balance: 1450.00, // Viv's initial checking balance
    institution_name: 'Chase',
    last_updated: new Date().toISOString(),
    notes: 'Main operating account',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'viv-acc-savings',
    user_id: 'demo-user-id-001',
    name: 'High Yield Savings',
    account_type: 'savings',
    current_balance: 5000.00, // Viv's initial savings balance
    institution_name: 'Ally',
    last_updated: new Date().toISOString(),
    notes: 'Emergency fund',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

let demoAccountsMemory: Account[] = [...VIV_ACCOUNTS]
let demoIncomeMemory: Income[] = []
let demoExpenseMemory: Expense[] = []
let demoBudgetsMemory: Budget[] = [
  {
    id: 'viv-budget-rent',
    user_id: 'demo-user-id-001',
    category: 'housing',
    monthly_amount: 495.00, // Rent obligation
    start_date: '2026-09-01',
    end_date: null,
    warning_threshold: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

export async function getAccounts(): Promise<Account[]> {
  try {
    const { data, error } = await (supabase
      .from('accounts' as any) as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) return demoAccountsMemory
    return data as Account[]
  } catch {
    return demoAccountsMemory
  }
}

export async function createAccount(
  account: Omit<InsertTables<'accounts'>, 'user_id'>
): Promise<Account | null> {
  const newAccount: Account = {
    id: `demo-acc-${Date.now()}`,
    user_id: 'demo-user-id-001',
    name: account.name,
    account_type: account.account_type,
    current_balance: account.current_balance ?? 0,
    institution_name: account.institution_name ?? null,
    last_updated: new Date().toISOString(),
    notes: account.notes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  demoAccountsMemory = [newAccount, ...demoAccountsMemory]
  return newAccount
}

export async function deleteAccount(id: string): Promise<boolean> {
  demoAccountsMemory = demoAccountsMemory.filter((a) => a.id !== id)
  return true
}

export async function getIncomeLogs(): Promise<Income[]> {
  return demoIncomeMemory
}

export async function logIncome(
  income: Omit<InsertTables<'income'>, 'user_id'>
): Promise<Income | null> {
  const newIncome: Income = {
    id: `demo-inc-${Date.now()}`,
    user_id: 'demo-user-id-001',
    source: income.source,
    amount: income.amount,
    date: income.date,
    frequency: income.frequency ?? 'one_time',
    category: income.category ?? 'job',
    notes: income.notes ?? null,
    created_at: new Date().toISOString(),
  }

  demoIncomeMemory = [newIncome, ...demoIncomeMemory]
  return newIncome
}

export async function getExpenses(): Promise<Expense[]> {
  return demoExpenseMemory
}

export async function logExpense(
  expense: Omit<InsertTables<'expenses'>, 'user_id'>
): Promise<Expense | null> {
  const newExpense: Expense = {
    id: `demo-exp-${Date.now()}`,
    user_id: 'demo-user-id-001',
    merchant: expense.merchant,
    amount: expense.amount,
    date: expense.date,
    category: expense.category,
    recurring: expense.recurring ?? false,
    notes: expense.notes ?? null,
    created_at: new Date().toISOString(),
  }

  demoExpenseMemory = [newExpense, ...demoExpenseMemory]
  return newExpense
}

export async function getBudgets(): Promise<Budget[]> {
  return demoBudgetsMemory
}

export async function getFinancialOverview() {
  const [accountsList, incomeLogs, expenseLogs, budgets] = await Promise.all([
    getAccounts(),
    getIncomeLogs(),
    getExpenses(),
    getBudgets(),
  ])

  const totalBalance = accountsList.reduce((sum, a) => sum + (a.current_balance ?? 0), 0)

  // Calculate actuals for current month
  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const actualIncome = incomeLogs
    .filter((i) => i.date.startsWith(currentMonthStr))
    .reduce((sum, i) => sum + i.amount, 0)

  const actualExpenses = expenseLogs
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0)

  // Viv's Job Calculations (Projected gross weekly & monthly calculations)
  // Job 1: Tech Shop - $13.00/hour, 35 scheduled hours/week (Mon-Fri 10AM-5PM)
  const techShopWeeklyProjected = 35 * 13.00
  const techShopMonthlyProjected = techShopWeeklyProjected * 4.33 // 4.33 weeks per average month

  // Job 2: Second Job - $18.00/hour, 6 scheduled hours/week (Mon/Wed 12PM-3PM)
  const secondJobWeeklyProjected = 6 * 18.00
  const secondJobMonthlyProjected = secondJobWeeklyProjected * 4.33

  const totalWeeklyProjectedGross = techShopWeeklyProjected + secondJobWeeklyProjected
  const totalMonthlyProjectedGross = techShopMonthlyProjected + secondJobMonthlyProjected

  // Fixed Monthly Expenses
  const rentExpense = 495.00 // Fixed Monthly Rent Due on 1st

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    monthlyIncome: Math.round(actualIncome * 100) / 100,
    monthlyExpenses: Math.round(actualExpenses * 100) / 100,
    netSavings: Math.round((actualIncome - actualExpenses) * 100) / 100,
    savingsRate: actualIncome > 0 ? Math.max(0, Math.round(((actualIncome - actualExpenses) / actualIncome) * 100)) : 0,

    // Viv's Specific Job Projections
    projectedWeeklyGross: totalWeeklyProjectedGross,
    projectedMonthlyGross: totalMonthlyProjectedGross,
    projectedRentExpense: rentExpense,
    jobsList: [
      { name: 'Tech Shop', rate: 13.00, weeklyHours: 35, projectedWeekly: techShopWeeklyProjected },
      { name: 'Second Job', rate: 18.00, weeklyHours: 6, projectedWeekly: secondJobWeeklyProjected }
    ],

    accounts: accountsList,
    incomeLogs,
    expenseLogs,
    budgets,
  }
}

export async function createBudget(
  budget: Omit<InsertTables<'budgets'>, 'user_id'>
): Promise<Budget | null> {
  const newBudget: Budget = {
    id: `demo-b-${Date.now()}`,
    user_id: 'demo-user-id-001',
    category: budget.category,
    monthly_amount: budget.monthly_amount,
    start_date: budget.start_date,
    end_date: budget.end_date ?? null,
    warning_threshold: budget.warning_threshold ?? 80,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  demoBudgetsMemory = [...demoBudgetsMemory, newBudget]
  return newBudget
}
