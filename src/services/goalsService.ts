// ============================================
// Personal OS — Goals Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Goal, InsertTables, UpdateTables } from '@/types'

export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await (supabase
    .from('goals' as any) as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching goals:', error)
    return []
  }

  return (data ?? []) as Goal[]
}

export async function createGoal(goal: Omit<InsertTables<'goals'>, 'user_id'>): Promise<Goal | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('goals' as any) as any)
    .insert({ ...goal, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating goal:', error)
    throw new Error(error.message)
  }

  return data as Goal
}

export async function updateGoal(id: string, updates: UpdateTables<'goals'>): Promise<Goal | null> {
  const { data, error } = await (supabase
    .from('goals' as any) as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating goal:', error)
    throw new Error(error.message)
  }

  return data as Goal
}

export async function deleteGoal(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('goals' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting goal:', error)
    return false
  }

  return true
}
