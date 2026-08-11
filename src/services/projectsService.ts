// ============================================
// Personal OS — Projects Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Project, InsertTables, UpdateTables } from '@/types'

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await (supabase
    .from('projects' as any) as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return (data ?? []) as Project[]
}

export async function createProject(project: Omit<InsertTables<'projects'>, 'user_id'>): Promise<Project | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('projects' as any) as any)
    .insert({ ...project, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error(error.message)
  }

  return data as Project
}

export async function updateProject(id: string, updates: UpdateTables<'projects'>): Promise<Project | null> {
  const { data, error } = await (supabase
    .from('projects' as any) as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw new Error(error.message)
  }

  return data as Project
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('projects' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return false
  }

  return true
}
