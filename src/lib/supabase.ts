// ============================================
// Personal OS — Supabase Client
// ============================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const fallbackUrl = 'https://demo-project.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tcHJvamVjdCIsInJvbGUiOiJhbW9uIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDA0OTYwMDB9.demo_key'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
