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

// ── Accounts ──

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await (supabase
    .from('accounts' as any) as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching accounts:', error)
    return []
  }

  return (data ?? []) as Account[]
}

export async function createAccount(
  account: Omit<InsertTables<'accounts'>, 'user_id'>
): Promise<Account | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('accounts' as any) as any)
    .insert({ ...account, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating account:', error)
    throw new Error(error.message)
  }

  return data as Account
}

export async function deleteAccount(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('accounts' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting account:', error)
    return false
  }

  return true
}

// ── Income Logging ──

export async function getIncomeLogs(): Promise<Income[]> {
  const { data, error } = await (supabase
    .from('income' as any) as any)
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching income logs:', error)
    return []
  }

  return (data ?? []) as Income[]
}

export async function logIncome(
  income: Omit<InsertTables<'income'>, 'user_id'>
): Promise<Income | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('income' as any) as any)
    .insert({ ...income, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error logging income:', error)
    throw new Error(error.message)
  }

  return data as Income
}

export async function deleteIncome(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('income' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting income:', error)
    return false
  }

  return true
}

// ── Expenses & Bills ──

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await (supabase
    .from('expenses' as any) as any)
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }

  return (data ?? []) as Expense[]
}

export async function logExpense(
  expense: Omit<InsertTables<'expenses'>, 'user_id'>
): Promise<Expense | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('expenses' as any) as any)
    .insert({ ...expense, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error logging expense:', error)
    throw new Error(error.message)
  }

  return data as Expense
}

export async function deleteExpense(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('expenses' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting expense:', error)
    return false
  }

  return true
}

// ── Category Budgets ──

export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await (supabase
    .from('budgets' as any) as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching budgets:', error)
    return []
  }

  return (data ?? []) as Budget[]
}

export async function createBudget(
  budget: Omit<InsertTables<'budgets'>, 'user_id'>
): Promise<Budget | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('budgets' as any) as any)
    .insert({ ...budget, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating budget:', error)
    throw new Error(error.message)
  }

  return data as Budget
}

// ── Financial Summary Helper ──

export async function getFinancialOverview() {
  const [accounts, incomeLogs, expenseLogs, budgets] = await Promise.all([
    getAccounts(),
    getIncomeLogs(),
    getExpenses(),
    getBudgets(),
  ])

  const totalBalance = accounts.reduce((sum, a) => sum + (a.current_balance ?? 0), 0)

  // Current month income & expenses
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
