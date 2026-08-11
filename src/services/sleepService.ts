// ============================================
// Personal OS — Sleep Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Tables, InsertTables } from '@/types'

export type SleepLog = Tables<'sleep_logs'>

export async function getSleepLogs(): Promise<SleepLog[]> {
  const { data, error } = await (supabase
    .from('sleep_logs' as any) as any)
    .select('*')
    .order('sleep_start', { ascending: false })

  if (error) {
    console.error('Error fetching sleep logs:', error)
    return []
  }

  return (data ?? []) as SleepLog[]
}

export async function logSleep(
  sleepStart: string,
  sleepEnd: string,
  sleepQuality = 4,
  notes?: string
): Promise<SleepLog | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const start = new Date(sleepStart).getTime()
  const end = new Date(sleepEnd).getTime()
  const durationMinutes = Math.max(0, Math.round((end - start) / 60000))

  const payload: InsertTables<'sleep_logs'> = {
    user_id: userData.user.id,
    sleep_start: new Date(sleepStart).toISOString(),
    sleep_end: new Date(sleepEnd).toISOString(),
    duration_minutes: durationMinutes,
    sleep_quality: sleepQuality,
    notes: notes ?? null,
  }

  const { data, error } = await (supabase
    .from('sleep_logs' as any) as any)
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error logging sleep:', error)
    throw new Error(error.message)
  }

  return data as SleepLog
}

export async function deleteSleepLog(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('sleep_logs' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting sleep log:', error)
    return false
  }

  return true
}
