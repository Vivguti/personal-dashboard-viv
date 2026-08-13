// ============================================
// Personal OS — App Root with Code-Split Routing
// ============================================

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Lazy load all pages to optimize loading speed and decrease initial bundle size
const AuthPage = lazy(() => import('@/pages/AuthPage').then(module => ({ default: module.AuthPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const TasksPage = lazy(() => import('@/pages/TasksPage').then(module => ({ default: module.TasksPage })))
const CalendarPage = lazy(() => import('@/pages/CalendarPage').then(module => ({ default: module.CalendarPage })))
const GoalsPage = lazy(() => import('@/pages/GoalsPage').then(module => ({ default: module.GoalsPage })))
const HealthPage = lazy(() => import('@/pages/HealthPage').then(module => ({ default: module.HealthPage })))
const FinancePage = lazy(() => import('@/pages/FinancePage').then(module => ({ default: module.FinancePage })))
const BusinessPage = lazy(() => import('@/pages/BusinessPage').then(module => ({ default: module.BusinessPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage })))

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#F3F7F3] flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <Routes>
              {/* Public route */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes */}
              <Route
                element={
                  <AuthGuard>
                    <AppShell />
                  </AuthGuard>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="health" element={<HealthPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="business" element={<BusinessPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
