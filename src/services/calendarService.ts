// ============================================
// Personal OS — Calendar Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { CalendarEvent, InsertTables, UpdateTables } from '@/types'

export async function getCalendarEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
  let query = (supabase.from('calendar_events' as any) as any).select('*')

  if (startDate) {
    query = query.gte('start_time', startDate.toISOString())
  }
  if (endDate) {
    query = query.lte('end_time', endDate.toISOString())
  }

  const { data, error } = await query.order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }

  return (data ?? []) as CalendarEvent[]
}

export async function createCalendarEvent(
  event: Omit<InsertTables<'calendar_events'>, 'user_id'>
): Promise<CalendarEvent | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('calendar_events' as any) as any)
    .insert({ ...event, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating calendar event:', error)
    throw new Error(error.message)
  }

  return data as CalendarEvent
}

export async function updateCalendarEvent(
  id: string,
  updates: UpdateTables<'calendar_events'>
): Promise<CalendarEvent | null> {
  const { data, error } = await (supabase
    .from('calendar_events' as any) as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating calendar event:', error)
    throw new Error(error.message)
  }

  return data as CalendarEvent
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('calendar_events' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting calendar event:', error)
    return false
  }

  return true
}

export async function getTodayFixedEvents(): Promise<CalendarEvent[]> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await (supabase
    .from('calendar_events' as any) as any)
    .select('*')
    .eq('is_fixed', true)
    .gte('start_time', startOfDay.toISOString())
    .lte('end_time', endOfDay.toISOString())
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching today fixed events:', error)
    return []
  }

  return (data ?? []) as CalendarEvent[]
}
