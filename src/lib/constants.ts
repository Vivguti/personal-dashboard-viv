// ============================================
// Personal OS — Application Constants
// ============================================

// ── Default Life Areas ──
export const DEFAULT_LIFE_AREAS = [
  { name: 'School', color: '#4F46E5', icon: 'graduation-cap' },
  { name: 'Business', color: '#059669', icon: 'briefcase' },
  { name: 'Health', color: '#EF4444', icon: 'heart' },
  { name: 'Fitness', color: '#F59E0B', icon: 'dumbbell' },
  { name: 'Finance', color: '#10B981', icon: 'wallet' },
  { name: 'Personal', color: '#8B5CF6', icon: 'user' },
  { name: 'Career', color: '#0EA5E9', icon: 'trending-up' },
  { name: 'Other', color: '#6B7280', icon: 'circle' },
] as const

// ── Quick Add Options ──
export const QUICK_ADD_OPTIONS = [
  { id: 'task', label: 'Task', icon: 'CheckSquare', color: '#4F46E5' },
  { id: 'event', label: 'Event', icon: 'CalendarPlus', color: '#0EA5E9' },
  { id: 'workout', label: 'Workout', icon: 'Dumbbell', color: '#F59E0B' },
  { id: 'meal', label: 'Meal', icon: 'UtensilsCrossed', color: '#059669' },
  { id: 'water', label: 'Water', icon: 'Droplets', color: '#06B6D4' },
  { id: 'supplement', label: 'Supplement', icon: 'Pill', color: '#8B5CF6' },
  { id: 'habit', label: 'Habit', icon: 'Repeat', color: '#EC4899' },
  { id: 'income', label: 'Income', icon: 'DollarSign', color: '#10B981' },
  { id: 'expense', label: 'Expense', icon: 'CreditCard', color: '#EF4444' },
  { id: 'project', label: 'Project', icon: 'FolderKanban', color: '#6366F1' },
  { id: 'goal', label: 'Goal', icon: 'Target', color: '#F97316' },
  { id: 'note', label: 'Note', icon: 'StickyNote', color: '#6B7280' },
] as const

// ── Navigation Items ──
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { path: '/calendar', label: 'Calendar', icon: 'CalendarDays' },
  { path: '/goals', label: 'Goals', icon: 'Target' },
  { path: '/health', label: 'Health', icon: 'Heart' },
  { path: '/finance', label: 'Finance', icon: 'Wallet' },
  { path: '/business', label: 'Business', icon: 'Briefcase' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const

// ── Priority Config ──
export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#6B7280', bgClass: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: '#F59E0B', bgClass: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', color: '#EF4444', bgClass: 'bg-red-100 text-red-700' },
  critical: { label: 'Critical', color: '#DC2626', bgClass: 'bg-red-200 text-red-800' },
} as const

// ── Energy Level Config ──
export const ENERGY_CONFIG = {
  low: { label: 'Low Energy', color: '#10B981' },
  medium: { label: 'Medium Energy', color: '#F59E0B' },
  high: { label: 'High Energy', color: '#EF4444' },
} as const

// ── Task Status Config ──
export const TASK_STATUS_CONFIG = {
  inbox: { label: 'Inbox', color: '#6B7280' },
  planned: { label: 'Planned', color: '#0EA5E9' },
  in_progress: { label: 'In Progress', color: '#F59E0B' },
  completed: { label: 'Completed', color: '#10B981' },
  deferred: { label: 'Deferred', color: '#8B5CF6' },
  cancelled: { label: 'Cancelled', color: '#EF4444' },
} as const

// ── Hydration Presets ──
export const HYDRATION_PRESETS = [
  { label: '+8 oz', amount: 8, unit: 'oz' as const },
  { label: '+12 oz', amount: 12, unit: 'oz' as const },
  { label: '+16 oz', amount: 16, unit: 'oz' as const },
  { label: '+24 oz', amount: 24, unit: 'oz' as const },
] as const

// ── Meal Types ──
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'other',
] as const

// ── Workout Types ──
export const WORKOUT_TYPES = [
  'strength',
  'cardio',
  'wrestling',
  'jiu_jitsu',
  'mobility',
  'recovery',
  'other',
] as const

// ── Expense Categories ──
export const EXPENSE_CATEGORIES = [
  'housing',
  'food',
  'transportation',
  'school',
  'business',
  'health',
  'fitness',
  'entertainment',
  'shopping',
  'subscriptions',
  'personal',
  'other',
] as const

// ── Income Categories ──
export const INCOME_CATEGORIES = [
  'job',
  'business',
  'freelance',
  'gift',
  'other',
] as const

// ── App Config ──
export const APP_CONFIG = {
  name: 'Personal OS',
  version: '1.0.0',
  phase: 'Phase 1 — Foundation',
  defaultHydrationTarget: 128, // oz
  defaultHydrationUnit: 'oz' as const,
} as const
