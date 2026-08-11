// ============================================
// Personal OS — Database Types
// ============================================
// Manual TypeScript types matching the Supabase schema.
// These will be replaced by auto-generated types when the
// Supabase CLI is configured (`npx supabase gen types typescript`).
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      task_dependencies: {
        Row: {
          id: string
          user_id: string
          task_id: string
          prerequisite_task_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          prerequisite_task_id: string
          created_at?: string
        }
        Update: {
          task_id?: string
          prerequisite_task_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          timezone: string
          preferred_start_time: string
          preferred_end_time: string
          default_task_duration: number
          daily_work_capacity: number
          weekly_work_capacity: number
          preferred_training_days: string[]
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          timezone?: string
          preferred_start_time?: string
          preferred_end_time?: string
          default_task_duration?: number
          daily_work_capacity?: number
          weekly_work_capacity?: number
          preferred_training_days?: string[]
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          timezone?: string
          preferred_start_time?: string
          preferred_end_time?: string
          default_task_duration?: number
          daily_work_capacity?: number
          weekly_work_capacity?: number
          preferred_training_days?: string[]
          onboarding_completed?: boolean
          updated_at?: string
        }
      }
      life_areas: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          icon: string | null
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          icon?: string | null
          sort_order?: number
          active?: boolean
        }
        Update: {
          name?: string
          color?: string | null
          icon?: string | null
          sort_order?: number
          active?: boolean
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          monthly_amount: number
          start_date: string
          end_date: string | null
          warning_threshold: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          monthly_amount: number
          start_date: string
          end_date?: string | null
          warning_threshold?: number | null
        }
        Update: {
          category?: string
          monthly_amount?: number
          start_date?: string
          end_date?: string | null
          warning_threshold?: number | null
        }
      }
      recurring_expenses: {
        Row: {
          id: string
          user_id: string
          merchant: string
          amount: number
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'
          next_due_date: string
          category: string
          active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          merchant: string
          amount: number
          frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'
          next_due_date: string
          category: string
          active?: boolean
          notes?: string | null
        }
        Update: {
          merchant?: string
          amount?: number
          frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'
          next_due_date?: string
          category?: string
          active?: boolean
          notes?: string | null
        }
      }
      financial_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          priority: 'low' | 'medium' | 'high' | 'critical'
          contribution_frequency: 'weekly' | 'biweekly' | 'monthly' | 'one_time'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          contribution_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'one_time'
        }
        Update: {
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          contribution_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'one_time'
        }
      }
      allocation_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          percentage: number | null
          fixed_amount: number | null
          priority: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          percentage?: number | null
          fixed_amount?: number | null
          priority?: number
          active?: boolean
        }
        Update: {
          name?: string
          category?: string
          percentage?: number | null
          fixed_amount?: number | null
          priority?: number
          active?: boolean
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          title: string
          description: string | null
          life_area_id: string | null
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'critical'
          deadline: string | null
          estimated_minutes: number | null
          completed_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          title: string
          description?: string | null
          life_area_id?: string | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          deadline?: string | null
          estimated_minutes?: number | null
          completed_minutes?: number
        }
        Update: {
          goal_id?: string | null
          title?: string
          description?: string | null
          life_area_id?: string | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          deadline?: string | null
          estimated_minutes?: number | null
          completed_minutes?: number
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          life_area_id: string | null
          priority: 'low' | 'medium' | 'high' | 'critical'
          target_value: number | null
          current_value: number
          unit: string | null
          target_date: string | null
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          life_area_id?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          target_value?: number | null
          current_value?: number
          unit?: string | null
          target_date?: string | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
        }
        Update: {
          title?: string
          description?: string | null
          category?: string | null
          life_area_id?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          target_value?: number | null
          current_value?: number
          unit?: string | null
          target_date?: string | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
        }
      }
      sleep_logs: {
        Row: {
          id: string
          user_id: string
          sleep_start: string
          sleep_end: string
          duration_minutes: number | null
          sleep_quality: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sleep_start: string
          sleep_end: string
          duration_minutes?: number | null
          sleep_quality?: number | null
          notes?: string | null
        }
        Update: {
          sleep_start?: string
          sleep_end?: string
          duration_minutes?: number | null
          sleep_quality?: number | null
          notes?: string | null
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string | null
          frequency: 'daily' | 'weekly' | 'monthly'
          target: number
          reminder_time: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly'
          target?: number
          reminder_time?: string | null
          active?: boolean
        }
        Update: {
          title?: string
          category?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly'
          target?: number
          reminder_time?: string | null
          active?: boolean
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_at: string
          value: number
          notes: string | null
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_at?: string
          value?: number
          notes?: string | null
        }
        Update: {
          value?: number
          notes?: string | null
        }
      }
      supplement_logs: {
        Row: {
          id: string
          supplement_id: string
          user_id: string
          scheduled_time: string | null
          taken_time: string | null
          status: 'scheduled' | 'taken' | 'skipped' | 'snoozed'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          supplement_id: string
          user_id: string
          scheduled_time?: string | null
          taken_time?: string | null
          status?: 'scheduled' | 'taken' | 'skipped' | 'snoozed'
          notes?: string | null
        }
        Update: {
          status?: 'scheduled' | 'taken' | 'skipped' | 'snoozed'
          notes?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          goal_id: string | null
          title: string
          description: string | null
          life_area_id: string | null
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'inbox' | 'planned' | 'in_progress' | 'completed' | 'deferred' | 'cancelled'
          estimated_minutes: number | null
          actual_minutes: number | null
          energy_required: 'low' | 'medium' | 'high'
          deadline: string | null
          scheduled_start: string | null
          scheduled_end: string | null
          recurring: boolean
          recurrence_rule: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          goal_id?: string | null
          title: string
          description?: string | null
          life_area_id?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'inbox' | 'planned' | 'in_progress' | 'completed' | 'deferred' | 'cancelled'
          estimated_minutes?: number | null
          actual_minutes?: number | null
          energy_required?: 'low' | 'medium' | 'high'
          deadline?: string | null
          scheduled_start?: string | null
          scheduled_end?: string | null
          recurring?: boolean
          recurrence_rule?: string | null
          completed_at?: string | null
        }
        Update: {
          project_id?: string | null
          goal_id?: string | null
          title?: string
          description?: string | null
          life_area_id?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'inbox' | 'planned' | 'in_progress' | 'completed' | 'deferred' | 'cancelled'
          estimated_minutes?: number | null
          actual_minutes?: number | null
          energy_required?: 'low' | 'medium' | 'high'
          deadline?: string | null
          scheduled_start?: string | null
          scheduled_end?: string | null
          recurring?: boolean
          recurrence_rule?: string | null
          completed_at?: string | null
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          location: string | null
          event_type: 'class' | 'meeting' | 'appointment' | 'deadline' | 'training' | 'personal' | 'business' | 'other'
          life_area_id: string | null
          source: 'manual' | 'google_calendar' | 'ai_suggested'
          external_id: string | null
          is_fixed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          location?: string | null
          event_type?: 'class' | 'meeting' | 'appointment' | 'deadline' | 'training' | 'personal' | 'business' | 'other'
          life_area_id?: string | null
          source?: 'manual' | 'google_calendar' | 'ai_suggested'
          external_id?: string | null
          is_fixed?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          event_type?: 'class' | 'meeting' | 'appointment' | 'deadline' | 'training' | 'personal' | 'business' | 'other'
          life_area_id?: string | null
          source?: 'manual' | 'google_calendar' | 'ai_suggested'
          external_id?: string | null
          is_fixed?: boolean
        }
      }
      hydration_logs: {
        Row: {
          id: string
          user_id: string
          amount: number
          unit: 'oz' | 'ml'
          timestamp: string
          source: 'manual' | 'quick_add' | 'ai'
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          unit?: 'oz' | 'ml'
          timestamp?: string
          source?: 'manual' | 'quick_add' | 'ai'
          notes?: string | null
        }
        Update: {
          amount?: number
          unit?: 'oz' | 'ml'
          timestamp?: string
          source?: 'manual' | 'quick_add' | 'ai'
          notes?: string | null
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
          name: string
          timestamp: string
          calories: number | null
          protein: number | null
          carbohydrates: number | null
          fat: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
          name: string
          timestamp?: string
          calories?: number | null
          protein?: number | null
          carbohydrates?: number | null
          fat?: number | null
          notes?: string | null
        }
        Update: {
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
          name?: string
          timestamp?: string
          calories?: number | null
          protein?: number | null
          carbohydrates?: number | null
          fat?: number | null
          notes?: string | null
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          title: string
          workout_type: 'strength' | 'cardio' | 'wrestling' | 'jiu_jitsu' | 'mobility' | 'recovery' | 'other'
          scheduled_time: string | null
          duration_minutes: number | null
          intensity: 'low' | 'medium' | 'high' | null
          completed: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          workout_type: 'strength' | 'cardio' | 'wrestling' | 'jiu_jitsu' | 'mobility' | 'recovery' | 'other'
          scheduled_time?: string | null
          duration_minutes?: number | null
          intensity?: 'low' | 'medium' | 'high' | null
          completed?: boolean
          notes?: string | null
        }
        Update: {
          title?: string
          workout_type?: 'strength' | 'cardio' | 'wrestling' | 'jiu_jitsu' | 'mobility' | 'recovery' | 'other'
          scheduled_time?: string | null
          duration_minutes?: number | null
          intensity?: 'low' | 'medium' | 'high' | null
          completed?: boolean
          notes?: string | null
        }
      }
      supplements: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string | null
          serving_size: string | null
          amount: number | null
          unit: string | null
          frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed' | 'other'
          preferred_time: string | null
          with_food: boolean
          start_date: string | null
          end_date: string | null
          active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand?: string | null
          serving_size?: string | null
          amount?: number | null
          unit?: string | null
          frequency?: 'daily' | 'twice_daily' | 'weekly' | 'as_needed' | 'other'
          preferred_time?: string | null
          with_food?: boolean
          start_date?: string | null
          end_date?: string | null
          active?: boolean
          notes?: string | null
        }
        Update: {
          name?: string
          brand?: string | null
          serving_size?: string | null
          amount?: number | null
          unit?: string | null
          frequency?: 'daily' | 'twice_daily' | 'weekly' | 'as_needed' | 'other'
          preferred_time?: string | null
          with_food?: boolean
          start_date?: string | null
          end_date?: string | null
          active?: boolean
          notes?: string | null
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          account_type: 'checking' | 'savings' | 'cash' | 'business' | 'other'
          current_balance: number
          institution_name: string | null
          last_updated: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          account_type: 'checking' | 'savings' | 'cash' | 'business' | 'other'
          current_balance?: number
          institution_name?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          account_type?: 'checking' | 'savings' | 'cash' | 'business' | 'other'
          current_balance?: number
          institution_name?: string | null
          notes?: string | null
        }
      }
      income: {
        Row: {
          id: string
          user_id: string
          source: string
          amount: number
          date: string
          frequency: 'one_time' | 'weekly' | 'biweekly' | 'monthly'
          category: 'job' | 'business' | 'freelance' | 'gift' | 'other'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source: string
          amount: number
          date: string
          frequency?: 'one_time' | 'weekly' | 'biweekly' | 'monthly'
          category?: 'job' | 'business' | 'freelance' | 'gift' | 'other'
          notes?: string | null
        }
        Update: {
          source?: string
          amount?: number
          date?: string
          frequency?: 'one_time' | 'weekly' | 'biweekly' | 'monthly'
          category?: 'job' | 'business' | 'freelance' | 'gift' | 'other'
          notes?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          merchant: string
          amount: number
          date: string
          category: 'housing' | 'food' | 'transportation' | 'school' | 'business' | 'health' | 'fitness' | 'entertainment' | 'shopping' | 'subscriptions' | 'personal' | 'other'
          recurring: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          merchant: string
          amount: number
          date: string
          category: 'housing' | 'food' | 'transportation' | 'school' | 'business' | 'health' | 'fitness' | 'entertainment' | 'shopping' | 'subscriptions' | 'personal' | 'other'
          recurring?: boolean
          notes?: string | null
        }
        Update: {
          merchant?: string
          amount?: number
          date?: string
          category?: 'housing' | 'food' | 'transportation' | 'school' | 'business' | 'health' | 'fitness' | 'entertainment' | 'shopping' | 'subscriptions' | 'personal' | 'other'
          recurring?: boolean
          notes?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ── Convenience type aliases ──
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// ── Commonly used row types ──
export type Profile = Tables<'profiles'>
export type Task = Tables<'tasks'>
export type Project = Tables<'projects'>
export type Goal = Tables<'goals'>
export type CalendarEvent = Tables<'calendar_events'>
export type HydrationLog = Tables<'hydration_logs'>
export type Meal = Tables<'meals'>
export type Workout = Tables<'workouts'>
export type Supplement = Tables<'supplements'>
export type Account = Tables<'accounts'>
export type Income = Tables<'income'>
export type Expense = Tables<'expenses'>
export type TaskDependency = Tables<'task_dependencies'>
