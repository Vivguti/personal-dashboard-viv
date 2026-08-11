import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'

import {
  Sparkles, Clock, CalendarDays, CheckCircle2,
  Droplets, Dumbbell, UtensilsCrossed, Moon,
  Wallet, Briefcase, Target, Zap, CheckSquare
} from 'lucide-react'

import type { Task, CalendarEvent, WorkloadSummary, Workout } from '@/types'
import { getTasks, toggleTaskComplete } from '@/services/tasksService'
import { getCalendarEvents } from '@/services/calendarService'
import { computeWorkloadSummary } from '@/services/workloadService'
import { getTodayHydrationSummary } from '@/services/hydrationService'
import { getWorkouts } from '@/services/workoutService'
import { getFinancialOverview } from '@/services/financeService'
import { getBusinessOverview } from '@/services/businessService'
import { AIAssistantDrawer } from '@/components/ai/AIAssistantDrawer'

export function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [workloadSummary, setWorkloadSummary] = useState<WorkloadSummary | null>(null)

  // Subsystems data
  const [hydrationSummary, setHydrationSummary] = useState<{ currentTotalOz: number; targetOz: number } | null>(null)
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const [activeProjectsCount, setActiveProjectsCount] = useState(0)
  const [totalBusinessRevenue, setTotalBusinessRevenue] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false)

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [allTasks, allEvents, hyd, wrks, fin, biz] = await Promise.all([
        getTasks(),
        getCalendarEvents(),
        getTodayHydrationSummary(),
        getWorkouts(),
        getFinancialOverview(),
        getBusinessOverview(),
      ])

      setTasks(allTasks)
      setEvents(allEvents)
      setHydrationSummary(hyd)
      setTodayWorkout(wrks[0] ?? null)
      setTotalBalance(fin.totalBalance)
      setActiveProjectsCount(biz.activeProjectsCount)
      setTotalBusinessRevenue(biz.totalRevenue)

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

  const userDisplayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Viv'

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  // Priority tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const topPriorities = pendingTasks.slice(0, 3)
  const nextAction = pendingTasks[0] ?? null

  const capacityPercent = workloadSummary?.percentageCapacityUsed ?? 65
  const capacityStatus = workloadSummary?.capacityStatus ?? 'Balanced'

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
      {/* 1. HERO GREETING */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#dce5de] dark:border-[#26352e]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#718078] dark:text-[#a8bdaf]">
            {todayDateString}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#26352e] dark:text-[#f3f7f3] tracking-tight mt-1">
            {getGreeting()}, {userDisplayName}.
          </h1>
          <p className="text-sm font-medium text-[#718078] dark:text-[#a8bdaf] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#315c4a] inline-block animate-pulse"></span>
            You're looking {capacityStatus.toLowerCase()} today. Let's make today count.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAIDrawerOpen(true)}
          className="bg-[#e8f0ea] dark:bg-[#26352e] text-[#315c4a] dark:text-[#f3f7f3] border border-[#c4d4ca] dark:border-[#315c4a] hover:bg-[#c4d4ca]"
          icon={<Sparkles size={16} />}
        >
          Plan My Day
        </Button>
      </header>

      {/* 2. AI COMMAND ENTRY ("What's on your mind?") */}
      <Card className="p-4 md:p-5 bg-gradient-to-r from-[#f3f7f3] via-white to-[#e8f0ea] dark:from-[#1c2722] dark:to-[#121b17] border border-[#c4d4ca] dark:border-[#26352e]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#315c4a] text-white rounded-xl shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#26352e] dark:text-[#f3f7f3]">What's on your mind?</h3>
              <p className="text-xs text-[#718078] dark:text-[#a8bdaf]">AI Life Assistant & Workload Optimizer</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setIsAIDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#26352e] border border-[#dce5de] dark:border-[#315c4a] text-xs font-bold text-[#315c4a] dark:text-[#f3f7f3] hover:bg-[#e8f0ea] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>✨</span> Plan my day
          </button>
          <button
            onClick={() => setIsAIDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#26352e] border border-[#dce5de] dark:border-[#315c4a] text-xs font-bold text-[#315c4a] dark:text-[#f3f7f3] hover:bg-[#e8f0ea] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>🧘</span> I'm overwhelmed
          </button>
          <button
            onClick={() => setIsAIDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#26352e] border border-[#dce5de] dark:border-[#315c4a] text-xs font-bold text-[#315c4a] dark:text-[#f3f7f3] hover:bg-[#e8f0ea] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>⚡</span> What should I do next?
          </button>
          <button
            onClick={() => setIsAIDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#26352e] border border-[#dce5de] dark:border-[#315c4a] text-xs font-bold text-[#315c4a] dark:text-[#f3f7f3] hover:bg-[#e8f0ea] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>💳</span> Review my spending
          </button>
        </div>
      </Card>

      {/* 3. DAILY COMMAND CENTER & CAPACITY visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Command Center & Priorities */}
        <div className="lg:col-span-2 space-y-6">
          {/* DAILY CAPACITY CARD */}
          <Card className="p-6 bg-white dark:bg-[#1c2722] border border-[#dce5de] dark:border-[#26352e]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718078] dark:text-[#a8bdaf]">
                  DAILY COMMAND CENTER
                </span>
                <h2 className="text-xl font-extrabold text-[#26352e] dark:text-[#f3f7f3] tracking-tight mt-0.5">
                  TODAY
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#e8f0ea] text-[#315c4a] dark:bg-[#26352e] dark:text-[#e8f0ea]">
                {capacityStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center pt-2">
              {/* Circular Capacity Ring */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#f3f7f3] dark:bg-[#121b17]">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#dce5de] dark:text-[#26352e]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#315c4a] dark:text-[#a8bdaf] transition-all duration-1000 ease-out"
                      strokeDasharray={`${capacityPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-[#26352e] dark:text-[#f3f7f3]">
                      {capacityPercent}%
                    </span>
                    <span className="text-[10px] font-bold text-[#718078] uppercase">capacity</span>
                  </div>
                </div>
              </div>

              {/* Metrics Summary */}
              <div className="sm:col-span-2 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
                  <div>
                    <div className="text-lg font-extrabold text-[#26352e] dark:text-[#f3f7f3]">
                      {pendingTasks.length}
                    </div>
                    <div className="text-[11px] text-[#718078] font-medium">priorities</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-[#26352e] dark:text-[#f3f7f3]">
                      {events.length}
                    </div>
                    <div className="text-[11px] text-[#718078] font-medium">commitments</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-[#26352e] dark:text-[#f3f7f3]">
                      {Math.floor((workloadSummary?.scheduledMinutes ?? 320) / 60)}h{' '}
                      {(workloadSummary?.scheduledMinutes ?? 320) % 60}m
                    </div>
                    <div className="text-[11px] text-[#718078] font-medium">planned</div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold text-[#718078] mb-1.5">
                    <span>Available focus time remaining</span>
                    <span className="text-[#315c4a] font-bold">
                      {Math.floor((workloadSummary?.remainingCapacityMinutes ?? 160) / 60)}h{' '}
                      {(workloadSummary?.remainingCapacityMinutes ?? 160) % 60}m available
                    </span>
                  </div>
                  <ProgressBar value={capacityPercent} />
                </div>
              </div>
            </div>
          </Card>

          {/* 4. NEXT UP HERO ACTION */}
          {nextAction && (
            <Card className="p-5 bg-[#315c4a] text-white border-none shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#26352e] text-[#a8bdaf] inline-flex items-center gap-1">
                    <Zap size={10} /> NEXT UP
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white">{nextAction.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#a8bdaf]">
                    {nextAction.estimated_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {nextAction.estimated_minutes} mins focus
                      </span>
                    )}
                    {nextAction.deadline && (
                      <span>Due {new Date(nextAction.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleToggleTask(nextAction)}
                  className="bg-white text-[#315c4a] hover:bg-[#f3f7f3] border-none font-bold text-xs shadow-xs"
                  icon={<CheckCircle2 size={16} className="text-[#315c4a]" />}
                >
                  Start Focus
                </Button>
              </div>
            </Card>
          )}

          {/* 5. TODAY'S PRIORITIES (Ranked 01, 02, 03) */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#26352e] dark:text-[#f3f7f3]">
                  Today's Priorities
                </h3>
                <p className="text-xs text-[#718078] dark:text-[#a8bdaf]">
                  {topPriorities.length} key tasks needing your focus
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-xs text-[#718078] py-4 text-center">Loading priorities...</div>
            ) : topPriorities.length > 0 ? (
              <div className="space-y-3">
                {topPriorities.map((task, index) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-[#fbfaf6] dark:bg-[#121b17] border border-[#dce5de] dark:border-[#26352e] flex items-center justify-between transition-all hover:border-[#a8bdaf]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="text-xs font-black text-[#a8bdaf]">
                        0{index + 1}
                      </span>
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          task.status === 'completed'
                            ? 'bg-[#315c4a] border-[#315c4a] text-white'
                            : 'border-[#a8bdaf] hover:border-[#315c4a]'
                        }`}
                      >
                        {task.status === 'completed' && <CheckSquare size={13} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[#26352e] dark:text-[#f3f7f3] truncate">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#718078] mt-0.5">
                          <span className="font-semibold uppercase tracking-wider text-[#315c4a] dark:text-[#a8bdaf]">
                            {task.priority}
                          </span>
                          {task.estimated_minutes && <span>· {task.estimated_minutes}m</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#718078]">
                No pending priorities. All caught up for today!
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1 col): Timeline, Wellness, Money, Business */}
        <div className="space-y-6">
          {/* 6. "YOUR DAY" TIMELINE */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#26352e] dark:text-[#f3f7f3] flex items-center gap-2">
                <CalendarDays size={16} className="text-[#315c4a]" /> YOUR DAY
              </h3>
              <span className="text-[10px] font-bold uppercase text-[#718078]">Timeline</span>
            </div>

            <div className="relative pl-4 space-y-4 border-l-2 border-[#e8f0ea] dark:border-[#26352e] ml-2">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#315c4a]"></div>
                <div className="text-xs font-bold text-[#315c4a]">9:00 AM</div>
                <div className="text-xs font-semibold text-[#26352e] dark:text-[#f3f7f3]">
                  Architecture Studio Session
                </div>
                <div className="text-[10px] text-[#718078]">Fixed Commitment</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#a8bdaf]"></div>
                <div className="text-xs font-bold text-[#718078]">11:00 AM</div>
                <div className="text-xs font-semibold text-[#26352e] dark:text-[#f3f7f3]">
                  Physics Problem Set
                </div>
                <div className="text-[10px] text-[#718078]">Flexible Task</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#315c4a]"></div>
                <div className="text-xs font-bold text-[#315c4a]">2:00 PM</div>
                <div className="text-xs font-semibold text-[#26352e] dark:text-[#f3f7f3]">
                  Client Strategy Briefing
                </div>
                <div className="text-[10px] text-[#718078]">Fixed Commitment</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#a8bdaf]"></div>
                <div className="text-xs font-bold text-[#718078]">4:30 PM</div>
                <div className="text-xs font-semibold text-[#26352e] dark:text-[#f3f7f3]">
                  Training & Mobility
                </div>
                <div className="text-[10px] text-[#718078]">Wellness</div>
              </div>
            </div>
          </Card>

          {/* 7. YOUR WELLNESS SECTION */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#26352e] dark:text-[#f3f7f3] flex items-center gap-2">
                <Droplets size={16} className="text-[#315c4a]" /> YOUR WELLNESS
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#f3f7f3] dark:bg-[#121b17] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[#718078]">
                  <Droplets size={14} className="text-[#315c4a]" /> Water
                </div>
                <div className="font-extrabold text-[#26352e] dark:text-[#f3f7f3] text-sm mt-1">
                  {hydrationSummary?.currentTotalOz ?? 64} / {hydrationSummary?.targetOz ?? 96} oz
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f3f7f3] dark:bg-[#121b17] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[#718078]">
                  <Dumbbell size={14} className="text-[#315c4a]" /> Movement
                </div>
                <div className="font-bold text-[#315c4a] dark:text-[#a8bdaf] text-xs mt-1">
                  {todayWorkout ? 'Logged ✓' : 'Workout ready'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f3f7f3] dark:bg-[#121b17] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[#718078]">
                  <UtensilsCrossed size={14} className="text-[#315c4a]" /> Nutrition
                </div>
                <div className="font-bold text-[#26352e] dark:text-[#f3f7f3] text-xs mt-1">
                  2 / 3 Meals
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f3f7f3] dark:bg-[#121b17] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[#718078]">
                  <Moon size={14} className="text-[#315c4a]" /> Sleep
                </div>
                <div className="font-bold text-[#26352e] dark:text-[#f3f7f3] text-xs mt-1">
                  7h 42m
                </div>
              </div>
            </div>
          </Card>

          {/* 8. YOUR MONEY & YOUR BUSINESS SNAPSHOT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#718078] mb-1">
                <Wallet size={14} className="text-[#315c4a]" /> YOUR MONEY
              </div>
              <div className="text-lg font-black text-[#26352e] dark:text-[#f3f7f3]">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-[#315c4a] font-bold mt-1">Available balance</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#718078] mb-1">
                <Briefcase size={14} className="text-[#315c4a]" /> YOUR BUSINESS
              </div>
              <div className="text-lg font-black text-[#26352e] dark:text-[#f3f7f3]">
                ${totalBusinessRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-[#315c4a] font-bold mt-1">
                {activeProjectsCount} active projects
              </div>
            </Card>
          </div>

          {/* 9. WHAT YOU'RE BUILDING (GOALS) */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#718078]">
                WHAT YOU'RE BUILDING
              </h3>
              <Target size={14} className="text-[#315c4a]" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold text-[#26352e] dark:text-[#f3f7f3] mb-1">
                  <span>Architecture Portfolio</span>
                  <span className="text-[#315c4a]">72%</span>
                </div>
                <ProgressBar value={72} />
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#26352e] dark:text-[#f3f7f3] mb-1">
                  <span>Startup Client Pipeline</span>
                  <span className="text-[#315c4a]">41%</span>
                </div>
                <ProgressBar value={41} />
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#26352e] dark:text-[#f3f7f3] mb-1">
                  <span>Fitness & Mobility</span>
                  <span className="text-[#315c4a]">64%</span>
                </div>
                <ProgressBar value={64} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
    </div>
  )
}
