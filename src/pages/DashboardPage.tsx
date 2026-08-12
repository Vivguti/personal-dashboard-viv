import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

import {
  Sparkles, Clock, CalendarDays, CheckCircle2,
  Droplets, Dumbbell, UtensilsCrossed, Moon,
  Wallet, Briefcase, Target, Zap, CheckSquare,
  TrendingUp
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

// ─── Palette reference ────────────────────────────────────────────────────────
// Parchment  #f5e8d0 — page canvas
// Sand       #d6c7ad — dividers, chip fills, soft borders
// Olive      #b7c3a1 — status pills, softest accent
// Sage       #8c947d — icons, secondary labels, accent borders
// Bark       #5e6544 — hero surfaces, strong accents, primary CTA bg
// Olivewood  #2e2f22 — headings, primary body text
// White      #ffffff — card surfaces
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [workloadSummary, setWorkloadSummary] = useState<WorkloadSummary | null>(null)
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

  useEffect(() => { loadDashboardData() }, [loadDashboardData])

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
  const todayDateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const topPriorities = pendingTasks.slice(0, 3)
  const nextAction = pendingTasks[0] ?? null
  const capacityPercent = workloadSummary?.percentageCapacityUsed ?? 65
  const capacityStatus = workloadSummary?.capacityStatus ?? 'Balanced'

  const priorityColor = (p: string) => {
    if (p === 'critical') return 'bg-[#a85d48]/10 text-[#a85d48] border-[#a85d48]/30'
    if (p === 'high') return 'bg-[#d6c7ad] text-[#5e6544] border-[#b7c3a1]'
    if (p === 'medium') return 'bg-[#b7c3a1]/30 text-[#5e6544] border-[#b7c3a1]'
    return 'bg-[#f5e8d0] text-[#8c947d] border-[#d6c7ad]'
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in">

      {/* ── 1. HERO GREETING ─────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#d6c7ad]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8c947d] mb-1">
            {todayDateString}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-[#2e2f22] tracking-tight leading-tight">
            {getGreeting()}, {userDisplayName}.
          </h1>
          <p className="text-sm text-[#5e6544] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#b7c3a1] inline-block"></span>
            Workload is <strong className="text-[#2e2f22]">{capacityStatus.toLowerCase()}</strong> — let's make today count.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAIDrawerOpen(true)}
          className="bg-[#5e6544] hover:bg-[#2e2f22] text-white border-none shadow-sm font-semibold"
          icon={<Sparkles size={14} />}
        >
          Plan My Day
        </Button>
      </header>

      {/* ── 2. AI QUICK-ENTRY STRIP ──────────────────────────────────────── */}
      <div className="bg-white border border-[#d6c7ad] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#5e6544] flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2e2f22]">What's on your mind?</p>
            <p className="text-xs text-[#8c947d]">AI Life Assistant · Workload Optimizer</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { emoji: '✨', label: 'Plan my day' },
            { emoji: '🧘', label: "I'm overwhelmed" },
            { emoji: '⚡', label: "What's next?" },
            { emoji: '💳', label: 'Review spending' },
          ].map(({ emoji, label }) => (
            <button
              key={label}
              onClick={() => setIsAIDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#f5e8d0] border border-[#d6c7ad] text-xs font-semibold text-[#5e6544] hover:bg-[#d6c7ad] hover:border-[#b7c3a1] transition-all"
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. MAIN GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── DAILY COMMAND CENTER ──────────────────────────────────────── */}
          <div className="bg-white border border-[#d6c7ad] rounded-2xl p-6 shadow-xs">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c947d]">Daily Command Center</p>
                <h2 className="text-lg font-black text-[#2e2f22] mt-0.5">Today's Overview</h2>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                capacityStatus === 'Balanced'   ? 'bg-[#b7c3a1]/20 text-[#5e6544] border-[#b7c3a1]'  :
                capacityStatus === 'Busy'       ? 'bg-[#d6c7ad]/40 text-[#5e6544] border-[#d6c7ad]'  :
                capacityStatus === 'Overloaded' ? 'bg-[#a85d48]/10 text-[#a85d48] border-[#a85d48]/30' :
                'bg-[#f5e8d0] text-[#8c947d] border-[#d6c7ad]'
              }`}>
                {capacityStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* SVG Ring — Bark bg, white stroke */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Track */}
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#d6c7ad"
                      strokeWidth="3.5"
                    />
                    {/* Progress — Bark color (#5e6544) */}
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#5e6544"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={`${capacityPercent} 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#2e2f22]">{capacityPercent}%</span>
                    <span className="text-[10px] font-semibold text-[#8c947d] uppercase tracking-wide">capacity</span>
                  </div>
                </div>
              </div>

              {/* Stats + bar — 2 cols */}
              <div className="sm:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: pendingTasks.length, label: 'Priorities' },
                    { value: events.length,       label: 'Events'     },
                    {
                      value: `${Math.floor((workloadSummary?.scheduledMinutes ?? 320) / 60)}h ${(workloadSummary?.scheduledMinutes ?? 320) % 60}m`,
                      label: 'Planned',
                    },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-[#f5e8d0] rounded-xl p-3 text-center">
                      <div className="text-lg font-black text-[#2e2f22]">{value}</div>
                      <div className="text-[10px] font-semibold text-[#8c947d] uppercase tracking-wide mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#8c947d] mb-1.5">
                    <span>Focus capacity used</span>
                    <span className="font-bold text-[#2e2f22]">
                      {Math.floor((workloadSummary?.remainingCapacityMinutes ?? 160) / 60)}h{' '}
                      {(workloadSummary?.remainingCapacityMinutes ?? 160) % 60}m free
                    </span>
                  </div>
                  {/* Custom progress bar — Bark (#5e6544) fill on Sand (#d6c7ad) track */}
                  <div className="w-full h-2.5 bg-[#d6c7ad] rounded-full overflow-hidden border border-[#b7c3a1]/50">
                    <div
                      className="h-full bg-[#5e6544] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── NEXT UP HERO ─────────────────────────────────────────────── */}
          {nextAction && (
            <div className="bg-[#5e6544] rounded-2xl p-5 shadow-sm relative overflow-hidden">
              {/* Subtle texture element */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-12 translate-x-12 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest">
                    <Zap size={10} /> Up Next
                  </span>
                  <h3 className="text-lg font-black text-white leading-snug">{nextAction.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-white/70 font-medium">
                    {nextAction.estimated_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {nextAction.estimated_minutes} min
                      </span>
                    )}
                    {nextAction.deadline && (
                      <span>Due {new Date(nextAction.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleTask(nextAction)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#5e6544] text-xs font-bold hover:bg-[#f5e8d0] transition-all shadow-xs shrink-0"
                >
                  <CheckCircle2 size={15} /> Start Focus
                </button>
              </div>
            </div>
          )}

          {/* ── TODAY'S PRIORITIES ───────────────────────────────────────── */}
          <div className="bg-white border border-[#d6c7ad] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-[#2e2f22]">Today's Priorities</h3>
                <p className="text-xs text-[#8c947d] mt-0.5">{topPriorities.length} task{topPriorities.length !== 1 ? 's' : ''} needing focus</p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-[#8c947d]">Loading…</div>
            ) : topPriorities.length > 0 ? (
              <div className="space-y-2.5">
                {topPriorities.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#f5e8d0] border border-[#d6c7ad] hover:border-[#8c947d] transition-all group"
                  >
                    <span className="text-[11px] font-black text-[#d6c7ad] w-5 shrink-0">0{index + 1}</span>
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                        task.status === 'completed'
                          ? 'bg-[#8c947d] border-[#8c947d]'
                          : 'border-[#b7c3a1] group-hover:border-[#8c947d]'
                      }`}
                    >
                      {task.status === 'completed' && <CheckSquare size={12} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${task.status === 'completed' ? 'line-through text-[#8c947d]' : 'text-[#2e2f22]'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${priorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.estimated_minutes && (
                          <span className="text-[10px] text-[#8c947d]">{task.estimated_minutes}m</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <CheckCircle2 size={28} className="text-[#b7c3a1] mx-auto mb-2" />
                <p className="text-xs text-[#8c947d]">All caught up for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — 1/3 width */}
        <div className="space-y-5">

          {/* ── YOUR DAY TIMELINE ────────────────────────────────────────── */}
          <div className="bg-white border border-[#d6c7ad] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#2e2f22] flex items-center gap-2">
                <CalendarDays size={14} className="text-[#8c947d]" /> Your Day
              </h3>
              <span className="text-[10px] font-semibold text-[#8c947d]">Timeline</span>
            </div>

            <div className="relative space-y-4 pl-5 border-l-2 border-[#d6c7ad] ml-1">
              {[
                { time: '9:00 AM', title: 'Architecture Studio', type: 'Fixed', fixed: true },
                { time: '11:00 AM', title: 'Physics Problem Set', type: 'Task', fixed: false },
                { time: '2:00 PM', title: 'Client Strategy Brief', type: 'Fixed', fixed: true },
                { time: '4:30 PM', title: 'Training & Mobility', type: 'Wellness', fixed: false },
              ].map(({ time, title, type, fixed }) => (
                <div key={time} className="relative">
                  <div className={`absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    fixed ? 'bg-[#5e6544]' : 'bg-[#b7c3a1]'
                  }`} />
                  <p className="text-[10px] font-bold text-[#8c947d] uppercase tracking-wide">{time}</p>
                  <p className="text-xs font-bold text-[#2e2f22] mt-0.5">{title}</p>
                  <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${
                    fixed ? 'bg-[#5e6544]/10 text-[#5e6544]' : 'bg-[#d6c7ad]/50 text-[#8c947d]'
                  }`}>
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── WELLNESS GRID ────────────────────────────────────────────── */}
          <div className="bg-white border border-[#d6c7ad] rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#2e2f22] mb-4 flex items-center gap-2">
              <Droplets size={14} className="text-[#8c947d]" /> Wellness
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  icon: <Droplets size={14} />,
                  label: 'Water',
                  value: `${hydrationSummary?.currentTotalOz ?? 64} / ${hydrationSummary?.targetOz ?? 96} oz`,
                  pct: ((hydrationSummary?.currentTotalOz ?? 64) / (hydrationSummary?.targetOz ?? 96)) * 100,
                },
                {
                  icon: <Dumbbell size={14} />,
                  label: 'Movement',
                  value: todayWorkout ? 'Done ✓' : 'Pending',
                  pct: todayWorkout ? 100 : 0,
                },
                {
                  icon: <UtensilsCrossed size={14} />,
                  label: 'Nutrition',
                  value: '2 / 3 meals',
                  pct: 67,
                },
                {
                  icon: <Moon size={14} />,
                  label: 'Sleep',
                  value: '7h 42m',
                  pct: 87,
                },
              ].map(({ icon, label, value, pct }) => (
                <div key={label} className="p-3 rounded-xl bg-[#f5e8d0] border border-[#d6c7ad]">
                  <div className="flex items-center gap-1.5 text-[#8c947d] mb-1.5">
                    {icon}
                    <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-xs font-black text-[#2e2f22] mb-1.5">{value}</p>
                  {/* Thin progress track */}
                  <div className="w-full h-1 bg-[#d6c7ad] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8c947d] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MONEY & BUSINESS ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#d6c7ad] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#8c947d] mb-2">
                <Wallet size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Money</span>
              </div>
              <p className="text-base font-black text-[#2e2f22]">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-[#8c947d] font-medium mt-0.5">Available</p>
            </div>
            <div className="bg-white border border-[#d6c7ad] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#8c947d] mb-2">
                <Briefcase size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Business</span>
              </div>
              <p className="text-base font-black text-[#2e2f22]">
                ${totalBusinessRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-[#8c947d] font-medium mt-0.5">{activeProjectsCount} projects</p>
            </div>
          </div>

          {/* ── GOALS PROGRESS ───────────────────────────────────────────── */}
          <div className="bg-white border border-[#d6c7ad] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#2e2f22] flex items-center gap-2">
                <Target size={14} className="text-[#8c947d]" /> Building
              </h3>
              <TrendingUp size={14} className="text-[#b7c3a1]" />
            </div>
            <div className="space-y-3.5">
              {[
                { label: 'Architecture Portfolio', pct: 72 },
                { label: 'Client Pipeline', pct: 41 },
                { label: 'Fitness & Mobility', pct: 64 },
              ].map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-[#2e2f22]">{label}</span>
                    <span className="text-[11px] font-bold text-[#8c947d]">{pct}%</span>
                  </div>
                  {/* Bark fill on Sand track */}
                  <div className="w-full h-2 bg-[#d6c7ad] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5e6544] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end right col */}
      </div>{/* end main grid */}

      <AIAssistantDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
    </div>
  )
}
