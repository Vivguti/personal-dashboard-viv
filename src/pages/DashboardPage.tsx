import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { WorkloadWidget } from '@/components/cards/WorkloadWidget'
import { CheckSquare, CalendarDays, BarChart3, Droplets, Wallet, Clock, Dumbbell } from 'lucide-react'
import type { Task, CalendarEvent, WorkloadSummary, Workout } from '@/types'
import { getTasks, toggleTaskComplete } from '@/services/tasksService'
import { getCalendarEvents } from '@/services/calendarService'
import { computeWorkloadSummary } from '@/services/workloadService'
import { getTodayHydrationSummary } from '@/services/hydrationService'
import { getWorkouts } from '@/services/workoutService'
import { getFinancialOverview } from '@/services/financeService'

export function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null)
  const [workloadSummary, setWorkloadSummary] = useState<WorkloadSummary | null>(null)
  const [hydrationSummary, setHydrationSummary] = useState<{ currentTotalOz: number; targetOz: number } | null>(null)
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [allTasks, allEvents, hyd, wrks, fin] = await Promise.all([
        getTasks(),
        getCalendarEvents(),
        getTodayHydrationSummary(),
        getWorkouts(),
        getFinancialOverview(),
      ])

      setTasks(allTasks)

      // Find nearest future calendar event
      const now = new Date()
      const upcoming = allEvents
        .filter((e) => new Date(e.start_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]

      setNextEvent(upcoming ?? null)
      setHydrationSummary(hyd)
      setTodayWorkout(wrks[0] ?? null)
      setTotalBalance(fin.totalBalance)

      // Compute workload
      setWorkloadSummary(computeWorkloadSummary("Today's Workload", allTasks, allEvents))
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleToggleTask = async (task: Task) => {
    const isCompleted = task.status === 'completed'
    const updated = await toggleTaskComplete(task.id, !isCompleted)
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      loadDashboardData()
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const todayTasks = tasks.slice(0, 4) // Show top 4 priority tasks
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {getGreeting()}, {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{todayDateString}</p>
      </header>

      {/* Workload Summary */}
      {workloadSummary && <WorkloadWidget summary={workloadSummary} />}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Priorities */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-700 dark:text-emerald-300">
                <CheckSquare size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Today's Priorities</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {todayTasks.length} tasks scheduled
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-xs text-gray-400 py-4">Loading tasks...</div>
          ) : todayTasks.length > 0 ? (
            <div className="space-y-3 mt-2">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {task.status === 'completed' && <CheckSquare size={12} />}
                  </button>
                  <span
                    className={`text-sm truncate flex-1 ${
                      task.status === 'completed'
                        ? 'line-through text-gray-400'
                        : 'text-gray-800 dark:text-gray-200 font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-28 flex flex-col items-center justify-center text-center text-xs text-gray-400">
              No active tasks yet
            </div>
          )}
        </Card>

        {/* Next Event */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg text-blue-700 dark:text-blue-300">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Next Event</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming schedule</p>
            </div>
          </div>

          {nextEvent ? (
            <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {nextEvent.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                <Clock size={12} />
                {new Date(nextEvent.start_time).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ) : (
            <div className="h-28 flex flex-col items-center justify-center text-center text-xs text-gray-400">
              No upcoming events scheduled
            </div>
          )}
        </Card>

        {/* Task Progress */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-700 dark:text-emerald-300">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Task Progress</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completion rate</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-medium">
              <span>Completed</span>
              <span>
                {completedCount} / {tasks.length}
              </span>
            </div>
            <ProgressBar value={progressPercent} />
          </div>
        </Card>

        {/* Training Widget */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/50 rounded-lg text-orange-700 dark:text-orange-300">
              <Dumbbell size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Training</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Workout status</p>
            </div>
          </div>
          {todayWorkout ? (
            <div className="h-20 flex flex-col items-center justify-center text-center">
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{todayWorkout.title}</div>
              <div className="text-xs text-orange-600 dark:text-orange-400 uppercase font-semibold mt-1">
                {todayWorkout.workout_type} · {todayWorkout.completed ? 'Completed' : 'Logged'}
              </div>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center text-xs text-gray-400">
              No workout logged today
            </div>
          )}
        </Card>

        {/* Health Hydration Widget */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-950/50 rounded-lg text-cyan-700 dark:text-cyan-300">
              <Droplets size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Hydration</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily target</p>
            </div>
          </div>
          <div className="h-20 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
              {hydrationSummary?.currentTotalOz ?? 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              / {hydrationSummary?.targetOz ?? 128} oz
            </div>
          </div>
        </Card>

        {/* Finance Snapshot */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-700 dark:text-emerald-300">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Finance</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Net balance</p>
            </div>
          </div>
          <div className="h-20 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              active accounts
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
