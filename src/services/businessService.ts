// ============================================
// Personal OS — Business Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Tables, InsertTables } from '@/types'

export type Client = Tables<'clients'>
export type Lead = Tables<'leads'>
export type BusinessProject = Tables<'business_projects'>
export type BusinessRevenue = Tables<'business_revenue'>

// ── Clients ──

export async function getClients(): Promise<Client[]> {
  const { data, error } = await (supabase
    .from('clients' as any) as any)
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return (data ?? []) as Client[]
}

export async function createClient(
  client: Omit<InsertTables<'clients'>, 'user_id'>
): Promise<Client | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('clients' as any) as any)
    .insert({ ...client, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    throw new Error(error.message)
  }

  return data as Client
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await (supabase
    .from('clients' as any) as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting client:', error)
    return false
  }

  return true
}

// ── Leads Pipeline ──

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await (supabase
    .from('leads' as any) as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return (data ?? []) as Lead[]
}

export async function createLead(
  lead: Omit<InsertTables<'leads'>, 'user_id'>
): Promise<Lead | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('leads' as any) as any)
    .insert({ ...lead, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating lead:', error)
    throw new Error(error.message)
  }

  return data as Lead
}

export async function updateLeadStatus(
  id: string,
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
): Promise<Lead | null> {
  const { data, error } = await (supabase
    .from('leads' as any) as any)
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating lead status:', error)
    throw new Error(error.message)
  }

  return data as Lead
}

// ── Business Projects ──

export async function getBusinessProjects(): Promise<BusinessProject[]> {
  const { data, error } = await (supabase
    .from('business_projects' as any) as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching business projects:', error)
    return []
  }

  return (data ?? []) as BusinessProject[]
}

export async function createBusinessProject(
  project: Omit<InsertTables<'business_projects'>, 'user_id'>
): Promise<BusinessProject | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('business_projects' as any) as any)
    .insert({ ...project, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating business project:', error)
    throw new Error(error.message)
  }

  return data as BusinessProject
}

// ── Business Revenue ──

export async function getBusinessRevenue(): Promise<BusinessRevenue[]> {
  const { data, error } = await (supabase
    .from('business_revenue' as any) as any)
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching business revenue:', error)
    return []
  }

  return (data ?? []) as BusinessRevenue[]
}

export async function logBusinessRevenue(
  revenue: Omit<InsertTables<'business_revenue'>, 'user_id'>
): Promise<BusinessRevenue | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Unauthenticated user')

  const { data, error } = await (supabase
    .from('business_revenue' as any) as any)
    .insert({ ...revenue, user_id: userData.user.id })
    .select()
    .single()

  if (error) {
    console.error('Error logging business revenue:', error)
    throw new Error(error.message)
  }

  return data as BusinessRevenue
}

// ── Business Overview Helper ──

export async function getBusinessOverview() {
  const [clients, leads, projects, revenue] = await Promise.all([
    getClients(),
    getLeads(),
    getBusinessProjects(),
    getBusinessRevenue(),
  ])

  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0)
  const pipelineValue = leads
    .filter((l) => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, l) => sum + (l.estimated_value ?? 0), 0)

  const activeProjectsCount = projects.filter((p) => p.status === 'active').length

  return {
    clientsCount: clients.length,
    activeProjectsCount,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pipelineValue: Math.round(pipelineValue * 100) / 100,
    clients,
    leads,
    projects,
    revenue,
  }
}
