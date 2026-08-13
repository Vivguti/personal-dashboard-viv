// ============================================
// Personal OS — Supabase Client Configuration
// ============================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const fallbackUrl = 'https://demo-project.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tcHJvamVjdCIsInJvbGUiOiJhbW9uIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDA0OTYwMDB9.demo_key'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey

export const isDemoMode = supabaseUrl === fallbackUrl

const realSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Eagerly intercept all calls when in demo mode to return mock/default structures instantly,
// preventing long network timeouts or delays from dead domains.
export const supabase = isDemoMode
  ? (new Proxy(realSupabase, {
      get(target, prop, receiver) {
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
            signUp: async () => ({ data: { user: null, session: null }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: (callback: any) => {
              // Call callback immediately with null session to trigger initial loading state change
              setTimeout(() => callback('SIGNED_IN', null), 0)
              return {
                data: { subscription: { unsubscribe: () => {} } },
              }
            },
          }
        }

        if (prop === 'from') {
          return () => {
            const builder: any = {
              select: () => builder,
              insert: () => builder,
              update: () => builder,
              delete: () => builder,
              eq: () => builder,
              neq: () => builder,
              gt: () => builder,
              lt: () => builder,
              gte: () => builder,
              lte: () => builder,
              order: () => builder,
              limit: () => builder,
              single: () => builder,
              then: (onfulfilled: any) => {
                return Promise.resolve(
                  onfulfilled({
                    data: null,
                    error: { message: 'Demo mode client bypass' },
                  })
                )
              },
            }
            return builder
          }
        }

        return Reflect.get(target, prop, receiver)
      },
    }) as unknown as typeof realSupabase)
  : realSupabase
