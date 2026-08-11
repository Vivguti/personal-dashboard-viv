// ============================================
// Personal OS — Shared Application Types
// ============================================

// Re-export database types for convenience
export type {
  Database,
  Tables,
  InsertTables,
  UpdateTables,
  Profile,
  Task,
  Goal,
  CalendarEvent,
  HydrationLog,
  Meal,
  Workout,
  Supplement,
  Account,
  Income,
  Expense,
} from './database.types'

// ── Priority & Status Enums ──

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type EnergyLevel = 'low' | 'medium' | 'high'

export type TaskStatus =
  | 'inbox'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'deferred'
  | 'cancelled'

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'

// ── Quick Add ──

export interface QuickAddOption {
  id: string
  label: string
  icon: string
  color: string
  description: string
}

// ── Navigation ──

export interface NavItem {
  path: string
  label: string
  icon: string
}

// ── Life Areas ──

export interface LifeArea {
  id: string
  name: string
  color: string
  icon?: string
}

// ── Theme ──

export type Theme = 'light' | 'dark' | 'system'
