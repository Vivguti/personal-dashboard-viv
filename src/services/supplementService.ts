// ============================================
// Personal OS — Supplement Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Supplement, InsertTables, UpdateTables, Tables } from '@/types'

export type SupplementLog = Tables<'supplement_logs'>

export async function getSupplements(): Promise<Supplement[]> {
  const { data, error } = await (supabase
    .from('supplements' as any) as any)
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching supplements:', error)
    return []
  }

  return (data ?? []) as Supplement[]
}

export async function createSupplement(
  supplement: Omit<InsertTables<'supplements'>, 'user_id'>
): Promise<Supplement | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('supplements' as any) as any)
    .insert({ ...supplement, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating supplement:', error)
    throw new Error(error.message)
  }

  return data as Supplement
}

export async function updateSupplement(
  id: string,
  updates: UpdateTables<'supplements'>
): Promise<Supplement | null> {
  const { data, error } = await (supabase
    .from('supplements' as any) as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating supplement:', error)
    throw new Error(error.message)
  }

  return data as Supplement
}

export async function deleteSupplement(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('supplements' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting supplement:', error)
    return false
  }

  return true
}

export async function getTodaySupplementLogs(): Promise<SupplementLog[]> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await (supabase
    .from('supplement_logs' as any) as any)
    .select('*')
    .gte('scheduled_time', startOfDay.toISOString())
    .lte('scheduled_time', endOfDay.toISOString())

  if (error) {
    console.error('Error fetching supplement logs:', error)
    return []
  }

  return (data ?? []) as SupplementLog[]
}

export async function logSupplementIntake(
  supplementId: string,
  status: 'taken' | 'skipped' | 'snoozed' = 'taken',
  notes?: string
): Promise<SupplementLog | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const nowIso = new Date().toISOString()
  const payload = {
    supplement_id: supplementId,
    user_id: userData.user.id,
    scheduled_time: nowIso,
    taken_time: status === 'taken' ? nowIso : null,
    status,
    notes: notes ?? null,
  }

  const { data, error } = await (supabase
    .from('supplement_logs' as any) as any)
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error logging supplement intake:', error)
    throw new Error(error.message)
  }

  return data as SupplementLog
}
