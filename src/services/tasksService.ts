// ============================================
// Personal OS — Tasks Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Task, InsertTables, UpdateTables } from '@/types'

const SAMPLE_DEMO_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    user_id: 'demo-user-id-001',
    project_id: null,
    goal_id: null,
    title: 'Review Q3 Engineering Deliverables',
    description: 'Audit system performance and verify release milestones.',
    life_area_id: null,
    priority: 'high',
    status: 'inbox',
    estimated_minutes: 45,
    actual_minutes: null,
    energy_required: 'high',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    scheduled_start: null,
    scheduled_end: null,
    recurring: false,
    recurrence_rule: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-task-2',
    user_id: 'demo-user-id-001',
    project_id: null,
    goal_id: null,
    title: 'Client Strategy Briefing',
    description: 'Prepare proposal deck for upcoming project review.',
    life_area_id: null,
    priority: 'medium',
    status: 'inbox',
    estimated_minutes: 30,
    actual_minutes: null,
    energy_required: 'medium',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    scheduled_start: null,
    scheduled_end: null,
    recurring: false,
    recurrence_rule: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-task-3',
    user_id: 'demo-user-id-001',
    project_id: null,
    goal_id: null,
    title: 'Evening Recovery & Mobility Session',
    description: '15 min foam rolling & hip mobility work.',
    life_area_id: null,
    priority: 'low',
    status: 'inbox',
    estimated_minutes: 20,
    actual_minutes: null,
    energy_required: 'low',
    deadline: null,
    scheduled_start: null,
    scheduled_end: null,
    recurring: true,
    recurrence_rule: 'daily',
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const TASKS_CACHE_KEY = 'viv_fallback_tasks'
let demoTasksMemory: Task[] = []
try {
  const cached = localStorage.getItem(TASKS_CACHE_KEY)
  demoTasksMemory = cached ? JSON.parse(cached) : [...SAMPLE_DEMO_TASKS]
} catch {
  demoTasksMemory = [...SAMPLE_DEMO_TASKS]
}

const saveTasksFallback = () => {
  try {
    localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(demoTasksMemory))
  } catch {}
}

export async function getTasks(): Promise<Task[]> {
  try {
    const { data, error } = await (supabase
      .from('tasks' as any) as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      return demoTasksMemory
    }

    return (data ?? []) as Task[]
  } catch {
    return demoTasksMemory
  }
}

export async function createTask(
  task: Omit<InsertTables<'tasks'>, 'user_id'>
): Promise<Task | null> {
  const newTask: Task = {
    id: `demo-task-${Date.now()}`,
    user_id: 'demo-user-id-001',
    project_id: task.project_id ?? null,
    goal_id: task.goal_id ?? null,
    title: task.title,
    description: task.description ?? null,
    life_area_id: task.life_area_id ?? null,
    priority: task.priority ?? 'medium',
    status: task.status ?? 'inbox',
    estimated_minutes: task.estimated_minutes ?? null,
    actual_minutes: task.actual_minutes ?? null,
    energy_required: task.energy_required ?? 'medium',
    deadline: task.deadline ?? null,
    scheduled_start: task.scheduled_start ?? null,
    scheduled_end: task.scheduled_end ?? null,
    recurring: task.recurring ?? false,
    recurrence_rule: task.recurrence_rule ?? null,
    completed_at: task.completed_at ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user && userData.user.id !== 'demo-user-id-001') {
      const { data, error } = await (supabase
        .from('tasks' as any) as any)
        .insert({ ...task, user_id: userData.user.id })
        .select()
        .single()

      if (!error && data) return data as Task
    }
  } catch {
    // Fallback to local state
  }

  demoTasksMemory = [newTask, ...demoTasksMemory]
  saveTasksFallback()
  return newTask
}

export async function updateTask(
  id: string,
  updates: UpdateTables<'tasks'>
): Promise<Task | null> {
  try {
    const { data, error } = await (supabase
      .from('tasks' as any) as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) return data as Task
  } catch {
    // Fallback
  }

  demoTasksMemory = demoTasksMemory.map((t) =>
    t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
  )
  saveTasksFallback()
  return demoTasksMemory.find((t) => t.id === id) ?? null
}

export async function toggleTaskComplete(
  id: string,
  completed: boolean
): Promise<Task | null> {
  return updateTask(id, {
    status: completed ? 'completed' : 'inbox',
    completed_at: completed ? new Date().toISOString() : null,
  })
}

export async function updateTaskSchedule(
  taskId: string,
  scheduledStart: string,
  scheduledEnd: string
): Promise<Task | null> {
  return updateTask(taskId, {
    scheduled_start: scheduledStart,
    scheduled_end: scheduledEnd,
    status: 'planned',
  })
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    const { error } = await (supabase
      .from('tasks' as any) as any)
      .delete()
      .eq('id', id)

    if (!error) return true
  } catch {
    // Fallback
  }

  demoTasksMemory = demoTasksMemory.filter((t) => t.id !== id)
  saveTasksFallback()
  return true
}

export async function getDeadlines(daysAhead = 7): Promise<Task[]> {
  const pending = await getTasks()
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + daysAhead)

  return pending.filter((t) => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d >= now && d <= future
  })
}

export async function getNextAction(): Promise<Task | null> {
  const pending = await getTasks()
  return pending.find((t) => t.status !== 'completed') ?? null
}
