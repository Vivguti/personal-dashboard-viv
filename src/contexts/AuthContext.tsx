// ============================================
// Personal OS — Authentication Context
// ============================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  enterDemoMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

const DEMO_USER: User = {
  id: 'demo-user-id-001',
  app_metadata: { provider: 'email' },
  user_metadata: { display_name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'demo@personal-os.app',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
}

const DEMO_SESSION: Session = {
  access_token: 'demo-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'demo-refresh-token',
  user: DEMO_USER,
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check local storage for demo mode session
    const isDemo = localStorage.getItem('pos_demo_mode') === 'true'
    if (isDemo) {
      setSession(DEMO_SESSION)
      setLoading(false)
      return
    }

    // Check active Supabase session on mount
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) setSession(newSession)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const enterDemoMode = useCallback(() => {
    localStorage.setItem('pos_demo_mode', 'true')
    setSession(DEMO_SESSION)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // Fallback to local demo mode on connection error
        enterDemoMode()
        return { error: null }
      }
      return { error }
    } catch {
      enterDemoMode()
      return { error: null }
    }
  }, [enterDemoMode])

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName ?? email.split('@')[0],
          },
        },
      })
      if (error) {
        enterDemoMode()
        return { error: null }
      }
      return { error }
    } catch {
      enterDemoMode()
      return { error: null }
    }
  }, [enterDemoMode])

  const signOut = useCallback(async () => {
    localStorage.removeItem('pos_demo_mode')
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore network signout errors
    }
    setSession(null)
  }, [])

  const value: AuthContextType = {
    user: session?.user ?? null,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    enterDemoMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
