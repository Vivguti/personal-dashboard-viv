// ============================================
// Personal OS — Habit Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Tables, InsertTables } from '@/types'

export type Habit = Tables<'habits'>
export type HabitCompletion = Tables<'habit_completions'>

export async function getHabits(): Promise<Habit[]> {
  const { data, error } = await (supabase
    .from('habits' as any) as any)
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching habits:', error)
    return []
  }

  return (data ?? []) as Habit[]
}

export async function createHabit(
  habit: Omit<InsertTables<'habits'>, 'user_id'>
): Promise<Habit | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('habits' as any) as any)
    .insert({ ...habit, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating habit:', error)
    throw new Error(error.message)
  }

  return data as Habit
}

export async function getTodayHabitCompletions(): Promise<HabitCompletion[]> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await (supabase
    .from('habit_completions' as any) as any)
    .select('*')
    .gte('completed_at', startOfDay.toISOString())
    .lte('completed_at', endOfDay.toISOString())

  if (error) {
    console.error('Error fetching habit completions:', error)
    return []
  }

  return (data ?? []) as HabitCompletion[]
}

export async function toggleHabitCompletion(
  habitId: string,
  isCompleted: boolean
): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  if (isCompleted) {
    // Insert completion
    const { error } = await (supabase
      .from('habit_completions' as any) as any)
      .insert({
        habit_id: habitId,
        user_id: userData.user.id,
        completed_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error completing habit:', error)
      return false
    }
  } else {
    // Delete today's completion
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const { error } = await (supabase
      .from('habit_completions' as any) as any)
      .delete()
      .eq('habit_id', habitId)
      .gte('completed_at', startOfDay.toISOString())

    if (error) {
      console.error('Error removing habit completion:', error)
      return false
    }
  }

  return true
}

export async function deleteHabit(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('habits' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting habit:', error)
    return false
  }

  return true
}
