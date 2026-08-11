// ============================================
// Personal OS — Workout Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Workout, InsertTables, UpdateTables } from '@/types'

export async function getWorkouts(): Promise<Workout[]> {
  const { data, error } = await (supabase
    .from('workouts' as any) as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workouts:', error)
    return []
  }

  return (data ?? []) as Workout[]
}

export async function createWorkout(
  workout: Omit<InsertTables<'workouts'>, 'user_id'>
): Promise<Workout | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('workouts' as any) as any)
    .insert({ ...workout, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating workout:', error)
    throw new Error(error.message)
  }

  return data as Workout
}

export async function updateWorkout(
  id: string,
  updates: UpdateTables<'workouts'>
): Promise<Workout | null> {
  const { data, error } = await (supabase
    .from('workouts' as any) as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating workout:', error)
    throw new Error(error.message)
  }

  return data as Workout
}

export async function toggleWorkoutComplete(id: string, completed: boolean): Promise<Workout | null> {
  return updateWorkout(id, { completed })
}

export async function deleteWorkout(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('workouts' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting workout:', error)
    return false
  }

  return true
}
