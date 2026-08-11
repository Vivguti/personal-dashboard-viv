// ============================================
// Personal OS — Hydration Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { HydrationLog, InsertTables } from '@/types'

export const DEFAULT_DAILY_HYDRATION_TARGET_OZ = 128

export async function getTodayHydrationLogs(): Promise<HydrationLog[]> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await (supabase
    .from('hydration_logs' as any) as any)
    .select('*')
    .gte('timestamp', startOfDay.toISOString())
    .lte('timestamp', endOfDay.toISOString())
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching hydration logs:', error)
    return []
  }

  return (data ?? []) as HydrationLog[]
}

export async function logHydration(
  amount: number,
  unit: 'oz' | 'ml' = 'oz',
  source: 'manual' | 'quick_add' | 'ai' = 'quick_add',
  notes?: string
): Promise<HydrationLog | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const payload: InsertTables<'hydration_logs'> = {
    user_id: userData.user.id,
    amount,
    unit,
    source,
    notes: notes ?? null,
    timestamp: new Date().toISOString(),
  }

  const { data, error } = await (supabase
    .from('hydration_logs' as any) as any)
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error logging hydration:', error)
    throw new Error(error.message)
  }

  return data as HydrationLog
}

export async function deleteHydrationLog(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('hydration_logs' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting hydration log:', error)
    return false
  }

  return true
}

export async function getTodayHydrationSummary(targetOz = DEFAULT_DAILY_HYDRATION_TARGET_OZ) {
  const logs = await getTodayHydrationLogs()
  const currentTotalOz = logs.reduce((sum, item) => {
    // Convert ml to oz if logged in ml
    const ozAmount = item.unit === 'ml' ? item.amount / 29.5735 : item.amount
    return sum + ozAmount
  }, 0)

  const roundedTotal = Math.round(currentTotalOz * 10) / 10
  const percentage = Math.min(100, Math.round((roundedTotal / targetOz) * 100))
  const remainingOz = Math.max(0, Math.round((targetOz - roundedTotal) * 10) / 10)

  return {
    currentTotalOz: roundedTotal,
    targetOz,
    percentage,
    remainingOz,
    logs,
  }
}
