// ============================================
// Personal OS — Life Areas Service
// ============================================

import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type LifeAreaRow = Database['public']['Tables']['life_areas']['Row']

export async function getLifeAreas(): Promise<LifeAreaRow[]> {
  const { data, error } = await supabase
    .from('life_areas')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching life areas:', error)
    return []
  }

  return data ?? []
}
