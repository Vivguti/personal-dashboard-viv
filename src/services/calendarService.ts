// ============================================
// Personal OS — Calendar Service & Scheduler
// ============================================

import { supabase } from '@/lib/supabase'
import type { CalendarEvent, InsertTables, UpdateTables } from '@/types'

// Viv's initial data fallback seed
const VIV_CLASSES_SEED = [
  {
    title: 'ARCH-305 Arch Design III',
    description: 'Architecture Design Studio. Fixed.',
    location: 'ARCA-400-40',
    event_type: 'class' as const,
    days: [1, 3, 5], // Mon, Wed, Fri
    start_time_str: '08:51:00',
    end_time_str: '11:20:00',
    is_fixed: true,
  },
  {
    title: 'ARCH-335 Architectural Systems',
    description: 'ARCC-105. Fixed.',
    location: 'ARCC-105',
    event_type: 'class' as const,
    days: [2, 4], // Tue, Thu
    start_time_str: '09:25:00',
    end_time_str: '10:25:00',
    is_fixed: true,
  },
  {
    title: 'URPN-340 Housing and Community',
    description: 'ARCC-305. Fixed.',
    location: 'ARCC-305',
    event_type: 'class' as const,
    days: [2, 4], // Tue, Thu
    start_time_str: '12:45:00',
    end_time_str: '14:00:00',
    is_fixed: true,
  }
]


// Dynamic recurrence generator for Viv's Fall 2026 semester classes (Aug 24, 2026 to Dec 15, 2026)
function generateVivClassEvents(): CalendarEvent[] {
  const generated: CalendarEvent[] = []
  const startSem = new Date('2026-08-24')
  const endSem = new Date('2026-12-15')

  let current = new Date(startSem)
  while (current <= endSem) {
    const dayOfWeek = current.getDay() // 0 = Sun, 1 = Mon, ...

    VIV_CLASSES_SEED.forEach((seed, index) => {
      if (seed.days.includes(dayOfWeek)) {
        const start = new Date(current)
        const sParts = seed.start_time_str.split(':').map(Number)
        const sH = sParts[0] ?? 0
        const sM = sParts[1] ?? 0
        const sS = sParts[2] ?? 0
        start.setHours(sH, sM, sS, 0)

        const end = new Date(current)
        const eParts = seed.end_time_str.split(':').map(Number)
        const eH = eParts[0] ?? 0
        const eM = eParts[1] ?? 0
        const eS = eParts[2] ?? 0
        end.setHours(eH, eM, eS, 0)

        generated.push({
          id: `viv-seed-class-${index}-${current.toISOString().slice(0, 10)}`,
          user_id: 'demo-user-id-001',
          title: seed.title,
          description: seed.description,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          location: seed.location,
          event_type: seed.event_type,
          life_area_id: 'school',
          source: 'manual',
          external_id: null,
          is_fixed: seed.is_fixed,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    })

    current.setDate(current.getDate() + 1)
  }

  // Generate Tech Shop current known schedule (10 AM to 5 PM for the current week)
  const today = new Date()
  const currentWeekMonday = new Date(today)
  currentWeekMonday.setDate(today.getDate() - today.getDay() + 1) // Monday of current week

  for (let i = 0; i < 5; i++) {
    const workDay = new Date(currentWeekMonday)
    workDay.setDate(currentWeekMonday.getDate() + i)

    const startWork = new Date(workDay)
    startWork.setHours(10, 0, 0, 0)

    const endWork = new Date(workDay)
    endWork.setHours(17, 0, 0, 0)

    generated.push({
      id: `viv-seed-techshop-work-${i}-${workDay.toISOString().slice(0, 10)}`,
      user_id: 'demo-user-id-001',
      title: 'Tech Shop Shift',
      description: 'Hourly Tech Shop shift. $13.00/hour.',
      start_time: startWork.toISOString(),
      end_time: endWork.toISOString(),
      location: 'Tech Shop',
      event_type: 'business',
      life_area_id: 'work',
      source: 'manual',
      external_id: null,
      is_fixed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // Generate Rent calendar deadlines (1st of every month)
  const rentMonths = ['2026-09-01', '2026-10-01', '2026-11-01', '2026-12-01']
  rentMonths.forEach((dateStr, index) => {
    generated.push({
      id: `viv-rent-deadline-${index}`,
      user_id: 'demo-user-id-001',
      title: 'RENT DUE ($495)',
      description: 'Recurring monthly housing rent obligation.',
      start_time: `${dateStr}T08:00:00.000Z`,
      end_time: `${dateStr}T08:00:00.000Z`, // deadline visual reminder only
      location: 'Apartment',
      event_type: 'personal',
      life_area_id: 'finance',
      source: 'manual',
      external_id: null,
      is_fixed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  })

  return generated
}

const CALENDAR_CACHE_KEY = 'viv_fallback_calendar'
let demoEventsMemory: CalendarEvent[] = []
try {
  const cached = localStorage.getItem(CALENDAR_CACHE_KEY)
  if (cached) {
    demoEventsMemory = JSON.parse(cached)
  } else {
    demoEventsMemory = generateVivClassEvents()
  }
} catch {
  demoEventsMemory = generateVivClassEvents()
}

const saveCalendarFallback = () => {
  try {
    localStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify(demoEventsMemory))
  } catch {}
}

export async function getCalendarEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
  try {
    let query = (supabase.from('calendar_events' as any) as any).select('*')

    if (startDate) {
      query = query.gte('start_time', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('end_time', endDate.toISOString())
    }

    const { data, error } = await query.order('start_time', { ascending: true })

    if (error || !data || data.length === 0) {
      // Filter memory fallback
      let filtered = [...demoEventsMemory]
      if (startDate) {
        filtered = filtered.filter(e => new Date(e.start_time) >= startDate)
      }
      if (endDate) {
        filtered = filtered.filter(e => new Date(e.end_time) <= endDate)
      }
      return filtered
    }

    return data as CalendarEvent[]
  } catch {
    return demoEventsMemory
  }
}

export async function createCalendarEvent(
  event: Omit<InsertTables<'calendar_events'>, 'user_id'>
): Promise<CalendarEvent | null> {
  const newEvent: CalendarEvent = {
    id: `demo-evt-${Date.now()}`,
    user_id: 'demo-user-id-001',
    title: event.title,
    description: event.description ?? null,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location ?? null,
    event_type: event.event_type ?? 'personal',
    life_area_id: event.life_area_id ?? null,
    source: event.source ?? 'manual',
    external_id: event.external_id ?? null,
    is_fixed: event.is_fixed ?? false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user && userData.user.id !== 'demo-user-id-001') {
      const { data, error } = await (supabase
        .from('calendar_events' as any) as any)
        .insert({ ...event, user_id: userData.user.id })
        .select()
        .single()

      if (!error && data) return data as CalendarEvent
    }
  } catch {
    // Fallback
  }

  demoEventsMemory = [...demoEventsMemory, newEvent]
  saveCalendarFallback()
  return newEvent
}

export async function updateCalendarEvent(
  id: string,
  updates: UpdateTables<'calendar_events'>
): Promise<CalendarEvent | null> {
  try {
    const { data, error } = await (supabase
      .from('calendar_events' as any) as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) return data as CalendarEvent
  } catch {
    // Fallback
  }

  demoEventsMemory = demoEventsMemory.map(e => e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e)
  saveCalendarFallback()
  return demoEventsMemory.find(e => e.id === id) ?? null
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from('calendar_events' as any) as any)
      .delete()
      .eq('id', id)

    if (!error) return true
  } catch {
    // Fallback
  }

  demoEventsMemory = demoEventsMemory.filter((e) => e.id !== id)
  saveCalendarFallback()
  return true
}

export async function getTodayFixedEvents(): Promise<CalendarEvent[]> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const todayEvents = await getCalendarEvents(startOfDay, endOfDay)
  return todayEvents.filter(e => e.is_fixed)
}
