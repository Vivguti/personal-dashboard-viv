/**
 * personal-os — Page Prefetcher Utility
 * Prefetches all route chunks in the background after initial paint
 * to ensure instant, zero-delay tab switching.
 */
export function prefetchAllPages() {
  const runPrefetch = () => {
    // Eagerly trigger module loader for all pages in the background
    // so they are cached in the browser for instant tab switching.
    import('@/pages/DashboardPage').catch(() => {})
    import('@/pages/TasksPage').catch(() => {})
    import('@/pages/CalendarPage').catch(() => {})
    import('@/pages/GoalsPage').catch(() => {})
    import('@/pages/HealthPage').catch(() => {})
    import('@/pages/FinancePage').catch(() => {})
    import('@/pages/BusinessPage').catch(() => {})
    import('@/pages/SettingsPage').catch(() => {})
  }

  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => runPrefetch())
    } else {
      setTimeout(runPrefetch, 500)
    }
  }
}
