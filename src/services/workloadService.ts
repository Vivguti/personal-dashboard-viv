// ============================================
// Personal OS — Workload Calculation Engine
// ============================================

import { supabase } from '@/lib/supabase'
import type { Task, CalendarEvent, WorkloadSummary, CapacityStatus } from '@/types'

export const DEFAULT_DAILY_CAPACITY_MINUTES = 480 // 8 hours default

export function classifyCapacityStatus(percentageUsed: number): CapacityStatus {
  if (percentageUsed <= 65) return 'Balanced'
  if (percentageUsed <= 85) return 'Busy'
  if (percentageUsed <= 100) return 'Near Capacity'
  return 'Overloaded'
}

export function computeWorkloadSummary(
  periodLabel: string,
  tasks: Task[],
  calendarEvents: CalendarEvent[],
  availableCapacityMinutes = DEFAULT_DAILY_CAPACITY_MINUTES
): WorkloadSummary {
  const now = new Date()

  let totalEstimatedMinutes = 0
  let totalActualMinutes = 0
  let completedMinutes = 0
  let remainingMinutes = 0
  let overdueMinutes = 0
  let scheduledMinutes = 0

  const energyBreakdown = {
    low: 0,
    medium: 0,
    high: 0,
  }

  // Aggregate task workload
  for (const task of tasks) {
    const est = task.estimated_minutes ?? 30
    const act = task.actual_minutes ?? 0

    totalEstimatedMinutes += est
    totalActualMinutes += act

    if (task.status === 'completed') {
      completedMinutes += est
    } else if (task.status !== 'cancelled') {
      remainingMinutes += est

      if (task.deadline && new Date(task.deadline) < now) {
        overdueMinutes += est
      }

      if (task.scheduled_start) {
        scheduledMinutes += est
      }

      // Energy distribution
      if (task.energy_required === 'low') energyBreakdown.low += est
      else if (task.energy_required === 'high') energyBreakdown.high += est
      else energyBreakdown.medium += est
    }
  }

  // Aggregate fixed calendar event time into scheduled minutes
  for (const event of calendarEvents) {
    if (event.start_time && event.end_time) {
      const start = new Date(event.start_time).getTime()
      const end = new Date(event.end_time).getTime()
      const durationMin = Math.max(0, Math.round((end - start) / 60000))
      scheduledMinutes += durationMin
    }
  }

  const remainingCapacityMinutes = Math.max(0, availableCapacityMinutes - remainingMinutes)
  const percentageCapacityUsed =
    availableCapacityMinutes > 0
      ? Math.round((remainingMinutes / availableCapacityMinutes) * 100)
      : 0

  const capacityStatus = classifyCapacityStatus(percentageCapacityUsed)

  return {
    periodLabel,
    totalEstimatedMinutes,
    totalActualMinutes,
    completedMinutes,
    remainingMinutes,
    overdueMinutes,
    scheduledMinutes,
    availableCapacityMinutes,
    remainingCapacityMinutes,
    percentageCapacityUsed,
    capacityStatus,
    energyBreakdown,
  }
}

// ── AI Tool / Helper Functions ──

export async function fetchWorkloadForPeriod(
  startDate: Date,
  endDate: Date,
  periodLabel: string
): Promise<WorkloadSummary> {
  const { data: tasks } = await (supabase
    .from('tasks' as any) as any)
    .select('*')

  const { data: events } = await (supabase
    .from('calendar_events' as any) as any)
    .select('*')
    .gte('start_time', startDate.toISOString())
    .lte('end_time', endDate.toISOString())

  return computeWorkloadSummary(periodLabel, (tasks ?? []) as Task[], (events ?? []) as CalendarEvent[])
}

export async function calculateAvailableCapacity(): Promise<number> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return DEFAULT_DAILY_CAPACITY_MINUTES

  const { data: profile } = await (supabase
    .from('profiles' as any) as any)
    .select('daily_work_capacity')
    .eq('id', userData.user.id)
    .single()

  const p = profile as { daily_work_capacity: number | null } | null
  return p?.daily_work_capacity ?? DEFAULT_DAILY_CAPACITY_MINUTES
}
