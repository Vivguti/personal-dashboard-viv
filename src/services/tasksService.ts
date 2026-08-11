// ============================================
// Personal OS — Tasks Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Task, InsertTables, UpdateTables, TaskStatus } from '@/types'

export interface TaskFilters {
  status?: TaskStatus
  projectId?: string
  goalId?: string
  lifeAreaId?: string
  priority?: string
  searchQuery?: string
}

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  let query = (supabase.from('tasks' as any) as any).select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId)
  }
  if (filters?.goalId) {
    query = query.eq('goal_id', filters.goalId)
  }
  if (filters?.lifeAreaId) {
    query = query.eq('life_area_id', filters.lifeAreaId)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters?.searchQuery) {
    query = query.ilike('title', `%${filters.searchQuery}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return (data ?? []) as Task[]
}

export async function createTask(task: Omit<InsertTables<'tasks'>, 'user_id'>): Promise<Task | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('tasks' as any) as any)
    .insert({ ...task, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    throw new Error(error.message)
  }

  return data as Task
}

export async function updateTask(id: string, updates: UpdateTables<'tasks'>): Promise<Task | null> {
  const { data, error } = await (supabase
    .from('tasks' as any) as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating task:', error)
    throw new Error(error.message)
  }

  return data as Task
}

export async function toggleTaskComplete(id: string, completed: boolean): Promise<Task | null> {
  const updates: UpdateTables<'tasks'> = {
    status: completed ? 'completed' : 'in_progress',
    completed_at: completed ? new Date().toISOString() : null,
  }

  return updateTask(id, updates)
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('tasks' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting task:', error)
    return false
  }

  return true
}

// ── AI Tool / Structured Helper Functions ──

export async function getDeadlines(daysAhead = 7): Promise<Task[]> {
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + daysAhead)

  const { data, error } = await (supabase
    .from('tasks' as any) as any)
    .select('*')
    .neq('status', 'completed')
    .neq('status', 'cancelled')
    .not('deadline', 'is', null)
    .lte('deadline', future.toISOString())
    .order('deadline', { ascending: true })

  if (error) {
    console.error('Error fetching deadlines:', error)
    return []
  }

  return (data ?? []) as Task[]
}

export async function getNextAction(): Promise<Task | null> {
  const { data, error } = await (supabase
    .from('tasks' as any) as any)
    .select('*')
    .neq('status', 'completed')
    .neq('status', 'cancelled')
    .order('priority', { ascending: false })
    .order('deadline', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching next action:', error)
    return null
  }

  return data as Task | null
}
