// ============================================
// Personal OS — Finance Service & Paycheck Engine
// ============================================

import { supabase } from '@/lib/supabase'
import type { Tables, InsertTables } from '@/types'

export type Account = Tables<'accounts'>
export type Income = Tables<'income'>
export type Expense = Tables<'expenses'>
export type Budget = Tables<'budgets'>
export type RecurringExpense = Tables<'recurring_expenses'>
export type FinancialGoal = Tables<'financial_goals'>
export type AllocationRule = Tables<'allocation_rules'>

const DEMO_ACCOUNTS: Account[] = [
  {
    id: 'demo-acc-1',
    user_id: 'demo-user-id-001',
    name: 'Primary Checking',
    account_type: 'checking',
    current_balance: 4850.0,
    institution_name: 'Chase',
    last_updated: new Date().toISOString(),
    notes: 'Main operating account',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-acc-2',
    user_id: 'demo-user-id-001',
    name: 'High Yield Savings',
    account_type: 'savings',
    current_balance: 12500.0,
    institution_name: 'Ally',
    last_updated: new Date().toISOString(),
    notes: 'Emergency fund',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

let demoAccountsMemory: Account[] = [...DEMO_ACCOUNTS]
let demoIncomeMemory: Income[] = []
let demoExpenseMemory: Expense[] = []

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

  try {
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user && userData.user.id !== 'demo-user-id-001') {
      const { data, error } = await (supabase
        .from('accounts' as any) as any)
        .insert({ ...account, user_id: userData.user.id })
        .select()
        .single()

      if (!error && data) return data as Account
    }
  } catch {
    // Fallback
  }

  demoAccountsMemory = [newAccount, ...demoAccountsMemory]
  return newAccount
}

export async function deleteAccount(id: string): Promise<boolean> {
  demoAccountsMemory = demoAccountsMemory.filter((a) => a.id !== id)
  return true
}

export async function getIncomeLogs(): Promise<Income[]> {
  try {
    const { data, error } = await (supabase
      .from('income' as any) as any)
      .select('*')
      .order('date', { ascending: false })

    if (error || !data) return demoIncomeMemory
    return data as Income[]
  } catch {
    return demoIncomeMemory
  }
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

export async function deleteIncome(id: string): Promise<boolean> {
  demoIncomeMemory = demoIncomeMemory.filter((i) => i.id !== id)
  return true
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const { data, error } = await (supabase
      .from('expenses' as any) as any)
      .select('*')
      .order('date', { ascending: false })

    if (error || !data) return demoExpenseMemory
    return data as Expense[]
  } catch {
    return demoExpenseMemory
  }
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

export async function deleteExpense(id: string): Promise<boolean> {
  demoExpenseMemory = demoExpenseMemory.filter((e) => e.id !== id)
  return true
}

export async function getBudgets(): Promise<Budget[]> {
  return []
}

export async function createBudget(
  budget: Omit<InsertTables<'budgets'>, 'user_id'>
): Promise<Budget | null> {
  return {
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
}

export async function getFinancialOverview() {
  const [accounts, incomeLogs, expenseLogs, budgets] = await Promise.all([
    getAccounts(),
    getIncomeLogs(),
    getExpenses(),
    getBudgets(),
  ])

  const totalBalance = accounts.reduce((sum, a) => sum + (a.current_balance ?? 0), 0)

  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthlyIncome = incomeLogs
    .filter((i) => i.date.startsWith(currentMonthStr))
    .reduce((sum, i) => sum + i.amount, 0)

  const monthlyExpenses = expenseLogs
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0)

  const netSavings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round((netSavings / monthlyIncome) * 100)) : 0

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    savingsRate,
    accounts,
    incomeLogs,
    expenseLogs,
    budgets,
  }
}
