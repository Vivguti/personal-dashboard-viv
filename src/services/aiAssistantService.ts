// ============================================
// Personal OS — AI Assistant & Tool Execution Engine
// ============================================

import { getTasks, updateTaskSchedule } from '@/services/tasksService'
import { getCalendarEvents } from '@/services/calendarService'
import { computeWorkloadSummary } from '@/services/workloadService'
import type { Task, CalendarEvent, WorkloadSummary } from '@/types'

export interface ProposedScheduleBlock {
  taskId: string
  taskTitle: string
  startTime: string
  endTime: string
  durationMinutes: number
}

export interface AIActionProposal {
  id: string
  title: string
  description: string
  type: 'schedule_optimization' | 'task_reschedule' | 'quick_task_create'
  blocks: ProposedScheduleBlock[]
}

// ── Query Helper 1: Today's Schedule ──

export async function getTodaySchedule(): Promise<{
  events: CalendarEvent[]
  scheduledTasks: Task[]
}> {
  const [allTasks, allEvents] = await Promise.all([getTasks(), getCalendarEvents()])

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  const events = allEvents.filter((e) => e.start_time.startsWith(todayStr))
  const scheduledTasks = allTasks.filter(
    (t) => t.scheduled_start && t.scheduled_start.startsWith(todayStr) && t.status !== 'completed'
  )

  return { events, scheduledTasks }
}

// ── Query Helper 2: Pending Tasks ──

export async function getPendingTasks(): Promise<Task[]> {
  const allTasks = await getTasks()
  const priorityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }

  return allTasks
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => {
      const pDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
      if (pDiff !== 0) return pDiff

      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (a.deadline) return -1
      if (b.deadline) return 1
      return 0
    })
}

// ── Query Helper 3: Workload Forecast ──

export async function getWorkloadForecast(): Promise<WorkloadSummary> {
  const [allTasks, allEvents] = await Promise.all([getTasks(), getCalendarEvents()])
  return computeWorkloadSummary("Today's Workload", allTasks, allEvents)
}

// ── Query Helper 4: Upcoming Deadlines ──

export async function getUpcomingDeadlines(): Promise<Task[]> {
  const pending = await getPendingTasks()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  return pending.filter((t) => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d <= sevenDaysFromNow
  })
}

// ── Query Helper 5: Available Capacity ──

export async function calculateAvailableCapacity(): Promise<{
  totalCapacityMinutes: number
  committedMinutes: number
  availableMinutes: number
}> {
  const forecast = await getWorkloadForecast()
  return {
    totalCapacityMinutes: forecast.availableCapacityMinutes,
    committedMinutes: forecast.scheduledMinutes,
    availableMinutes: forecast.remainingCapacityMinutes,
  }
}

// ── Query Helper 6: Get Next Action (#1 Recommended Task) ──

export async function getNextAction(): Promise<Task | null> {
  const pending = await getPendingTasks()

  // 1. Find critical/high priority tasks with imminent deadlines
  const urgentTask = pending.find((t) => {
    if (!t.deadline) return false
    const hoursLeft = (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60)
    return hoursLeft <= 24 && t.priority !== 'low'
  })

  if (urgentTask) return urgentTask

  // 2. Otherwise return highest priority uncompleted task
  return pending[0] ?? null
}

// ── Action Tool 1: Propose Schedule Optimization ──

export async function proposeScheduleOptimization(): Promise<AIActionProposal> {
  const [todayData, pending] = await Promise.all([getTodaySchedule(), getPendingTasks()])

  const now = new Date()
  let currentSlot = new Date(now.getTime() + 15 * 60 * 1000) // Start 15 mins from now
  const proposedBlocks: ProposedScheduleBlock[] = []

  // Top 3 tasks to schedule
  const tasksToSchedule = pending.slice(0, 3)

  for (const task of tasksToSchedule) {
    const duration = task.estimated_minutes ?? 30
    const slotEnd = new Date(currentSlot.getTime() + duration * 60 * 1000)

    // Check collision with fixed events
    const collision = todayData.events.find((e) => {
      const eStart = new Date(e.start_time)
      const eEnd = new Date(e.end_time)
      return currentSlot < eEnd && slotEnd > eStart
    })

    if (collision) {
      // Move past fixed event
      currentSlot = new Date(new Date(collision.end_time).getTime() + 10 * 60 * 1000)
    }

    const startIso = currentSlot.toISOString()
    const endIso = new Date(currentSlot.getTime() + duration * 60 * 1000).toISOString()

    proposedBlocks.push({
      taskId: task.id,
      taskTitle: task.title,
      startTime: startIso,
      endTime: endIso,
      durationMinutes: duration,
    })

    currentSlot = new Date(new Date(endIso).getTime() + 15 * 60 * 1000)
  }

  return {
    id: `opt-${Date.now()}`,
    title: 'Schedule Optimization Plan',
    description: `Auto-schedule ${proposedBlocks.length} top priority tasks into non-overlapping free time blocks today, protecting fixed calendar commitments.`,
    type: 'schedule_optimization',
    blocks: proposedBlocks,
  }
}

// ── Action Execution: Apply Approved Schedule ──

export async function applyProposedSchedule(proposal: AIActionProposal): Promise<boolean> {
  try {
    for (const block of proposal.blocks) {
      await updateTaskSchedule(block.taskId, block.startTime, block.endTime)
    }
    return true
  } catch (err) {
    console.error('Error applying proposed schedule:', err)
    return false
  }
}
