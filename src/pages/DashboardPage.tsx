import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

import {
  Sparkles, CheckCircle2, Wallet, Dumbbell, AlertTriangle, BarChart3, Calendar, Search
} from 'lucide-react'

import type { Task, CalendarEvent, WorkloadSummary } from '@/types'
import { getTasks, toggleTaskComplete } from '@/services/tasksService'
import { getCalendarEvents } from '@/services/calendarService'
import { computeWorkloadSummary } from '@/services/workloadService'
import { getTodayHydrationSummary } from '@/services/hydrationService'
import { getWorkouts } from '@/services/workoutService'
import { getFinancialOverview } from '@/services/financeService'
import { getBusinessOverview } from '@/services/businessService'
import { AIAssistantDrawer } from '@/components/ai/AIAssistantDrawer'
import { useAppSync, triggerSync } from '@/lib/sync'

// ─── Premium Sage & White Palette ─────────────────────────────────────────────
// Deep Botanical Green  : #315C4A   (buttons, active nav, rings)
// Light Sage            : #E8F0EA   (chip/tile backgrounds, borders)
// Very Light Sage       : #F3F7F3   (page bg, inner panels)
// White                 : #FFFFFF   (card surfaces)
// Dark Charcoal         : #26352E   (headings, primary text)
// Muted Green-Gray      : #718078   (secondary labels, subtitles)
// Sage                  : #A8BDAF   (icons, softer accents)
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [workloadSummary, setWorkloadSummary] = useState<WorkloadSummary | null>(null)
  const [hydrationSummary, setHydrationSummary] = useState<{ currentTotalOz: number; targetOz: number } | null>(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false)
  const [aiCommandMode, setAiCommandMode] = useState<'plan' | 'overwhelmed' | 'next' | null>(null)

  // Local storage confirmation flags
  const [isConflictDismissed, setIsConflictDismissed] = useState<boolean>(() => {
    return localStorage.getItem('pos_conflict_dismissed') === 'true'
  })
  const [secondJobStartDateConfirmed] = useState<string | null>(() => {
    return localStorage.getItem('pos_second_job_confirmed_start')
  })
  const [isStructuresConfirmed] = useState<boolean>(() => {
    return localStorage.getItem('pos_structures_confirmed') === 'true'
  })
  const [structuresTime] = useState<string>(() => {
    return localStorage.getItem('pos_structures_time') || '14:00'
  })

  const loadDashboardData = useCallback(async () => {
    try {
      const [allTasks, allEvents, hyd, , fin] = await Promise.all([
        getTasks(),
        getCalendarEvents(),
        getTodayHydrationSummary(),
        getWorkouts(),
        getFinancialOverview(),
        getBusinessOverview(),
      ])

      setTasks(allTasks)

      let finalEvents = [...allEvents]

      if (secondJobStartDateConfirmed) {
        const startSem = new Date(secondJobStartDateConfirmed)
        const endSem = new Date('2026-12-15')
        let currentJob = new Date(startSem)
        const todayDate = new Date()
        while (currentJob <= endSem) {
          if ((currentJob.getDay() === 1 || currentJob.getDay() === 3) && currentJob.toDateString() === todayDate.toDateString()) {
            const s = new Date(currentJob)
            s.setHours(12, 0, 0, 0)
            const e = new Date(currentJob)
            e.setHours(15, 0, 0, 0)
            finalEvents.push({
              id: `viv-secondjob-shift-${currentJob.toISOString().slice(0, 10)}`,
              user_id: 'demo-user-id-001',
              title: 'Second Job Shift',
              description: 'Second Job hourly shift. $18.00/hour.',
              start_time: s.toISOString(),
              end_time: e.toISOString(),
              location: 'Office',
              event_type: 'business',
              life_area_id: 'work',
              source: 'manual',
              external_id: null,
              is_fixed: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
          currentJob.setDate(currentJob.getDate() + 1)
        }
      }

      if (isStructuresConfirmed) {
        const startSem = new Date('2026-08-24')
        const endSem = new Date('2026-12-15')
        let currentClass = new Date(startSem)
        const todayDate = new Date()
        const [sH, sM] = structuresTime.split(':').map(Number)
        while (currentClass <= endSem) {
          if ((currentClass.getDay() === 2 || currentClass.getDay() === 4) && currentClass.toDateString() === todayDate.toDateString()) {
            const s = new Date(currentClass)
            s.setHours(sH ?? 14, sM ?? 0, 0, 0)
            const e = new Date(currentClass)
            e.setHours(sH ?? 14, (sM ?? 0) + 60, 0, 0)
            finalEvents.push({
              id: `viv-structures-class-${currentClass.toISOString().slice(0, 10)}`,
              user_id: 'demo-user-id-001',
              title: 'ARCH-331 Architectural Structures',
              description: 'ARCC-105. Fixed.',
              start_time: s.toISOString(),
              end_time: e.toISOString(),
              location: 'ARCC-105',
              event_type: 'class',
              life_area_id: 'school',
              source: 'manual',
              external_id: null,
              is_fixed: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
          currentClass.setDate(currentClass.getDate() + 1)
        }
      }

      setEvents(finalEvents)
      setHydrationSummary(hyd)
      setTotalBalance(fin.totalBalance)
      setWorkloadSummary(computeWorkloadSummary("Today's Workload", allTasks, finalEvents))
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    }
  }, [secondJobStartDateConfirmed, isStructuresConfirmed, structuresTime])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Global Sync Listener
  useAppSync(loadDashboardData)

  const handleToggleTask = async (task: Task) => {
    const isCompleted = task.status === 'completed'
    const updated = await toggleTaskComplete(task.id, !isCompleted)
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      triggerSync() // Notify other pages
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getGreetingPhrase = () => {
    return capacityPercent <= 70 ? "You're looking balanced today." : "Let's focus on what matters."
  }

  const todayDateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const topPriorities = pendingTasks.slice(0, 3)

  const capacityPercent = workloadSummary?.percentageCapacityUsed ?? 45
  const capacityStatus  = workloadSummary?.capacityStatus ?? 'Balanced'

  const priorityBadge = (p: string) => {
    if (p === 'critical') return 'bg-[#26352E] text-white border-[#26352E]'
    if (p === 'high')     return 'bg-[#315C4A]/15 text-[#315C4A] border-[#A8BDAF]'
    if (p === 'medium')   return 'bg-[#E8F0EA] text-[#718078] border-[#E8F0EA]'
    return 'bg-[#F3F7F3] text-[#718078] border-[#E8F0EA]'
  }

  const getTodayConflicts = () => {
    const conflicts: string[] = []
    const sorted = [...events].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i]
        const b = sorted[j]
        if (a && b) {
          const aStart = new Date(a.start_time).getTime()
          const aEnd   = new Date(a.end_time).getTime()
          const bStart = new Date(b.start_time).getTime()
          const bEnd   = new Date(b.end_time).getTime()
          if (aStart < bEnd && bStart < aEnd) {
            conflicts.push(`"${a.title}" overlaps with "${b.title}"`)
          }
        }
      }
    }
    return conflicts
  }

  const todayConflicts = getTodayConflicts()

  const handleDismissConflict = () => {
    setIsConflictDismissed(true)
    localStorage.setItem('pos_conflict_dismissed', 'true')
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in">

      {/* ── 1. HERO GREETING ────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E8F0EA]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#718078] mb-1">
            {todayDateString}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-[#26352E] tracking-tight leading-tight">
            {getGreeting()}, Viv.
          </h1>
          <p className="text-sm text-[#718078] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#315C4A] inline-block animate-pulse" />
            {getGreetingPhrase()} Workload is{' '}
            <strong className="text-[#315C4A]">{capacityStatus.toLowerCase()}</strong> today.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => { setAiCommandMode('plan'); setIsAIDrawerOpen(true) }}
          className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none shadow-sm font-semibold px-5"
          icon={<Sparkles size={14} />}
        >
          Plan My Day
        </Button>
      </header>

      {/* ── 2. SCHEDULE CONFLICT ALERT ──────────────────────────────────── */}
      {!isConflictDismissed && todayConflicts.length > 0 && (
        <div className="bg-[#26352E] border border-[#26352E] rounded-2xl p-4 space-y-3 text-white text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle size={16} className="text-[#A8BDAF]" />
            <span>WORK SCHEDULE CONFLICT</span>
          </div>
          <p className="leading-relaxed opacity-90">Your schedule contains overlapping commitments today:</p>
          <ul className="list-disc pl-5 space-y-1 opacity-90">
            {todayConflicts.map((c, idx) => <li key={idx} className="font-semibold">{c}</li>)}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={handleDismissConflict} className="px-3 py-1.5 bg-[#E8F0EA] text-[#26352E] font-bold rounded-xl text-[10px] hover:bg-white transition-all">Resolve</button>
            <button onClick={handleDismissConflict} className="px-3 py-1.5 bg-transparent text-white border border-white/30 font-bold rounded-xl text-[10px] hover:bg-white/10 transition-all">Keep Both</button>
            <button onClick={handleDismissConflict} className="px-3 py-1.5 bg-transparent text-white border border-white/30 font-bold rounded-xl text-[10px] hover:bg-white/10 transition-all">Adjust Work</button>
          </div>
        </div>
      )}

      {/* ── 3. AI TASK ORGANIZER SEARCH ─────────────────────────────────────────── */}
      <button 
        onClick={() => { setAiCommandMode('plan'); setIsAIDrawerOpen(true) }}
        className="w-full bg-[#315C4A] border-none rounded-2xl p-4 flex items-center gap-4 hover:bg-[#26352E] transition-all shadow-md text-left group"
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
          <Search size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">Ask AI to organize and prioritize your tasks...</p>
          <p className="text-xs text-white/80 mt-0.5 truncate">Type a question to help divide the order of tasks</p>
        </div>
        <div className="hidden sm:flex gap-2 flex-shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-[10px] font-bold text-white">✨ Plan my day</span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-[10px] font-bold text-white">🧘 I'm overwhelmed</span>
        </div>
      </button>

      {/* ── 4. MAIN GRID ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left 2 cols ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Daily Command Center */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F3F7F3]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#718078]">Daily Command Center</p>
                <h2 className="text-lg font-black text-[#26352E] mt-0.5">Today's Overview</h2>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                capacityStatus === 'Balanced'
                  ? 'bg-[#E8F0EA] text-[#315C4A] border-[#A8BDAF]'
                  : capacityStatus === 'Busy'
                  ? 'bg-[#F3F7F3] text-[#718078] border-[#E8F0EA]'
                  : 'bg-[#26352E] text-white border-[#26352E]'
              }`}>
                {capacityStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Capacity ring */}
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E8F0EA" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#315C4A"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={`${capacityPercent} 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-[#26352E]">{capacityPercent}%</span>
                    <span className="text-[8px] font-bold text-[#718078] uppercase tracking-wide">capacity</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="sm:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: pendingTasks.length, label: 'Priorities' },
                    { value: events.length,       label: 'Events'     },
                    {
                      value: `${Math.floor((workloadSummary?.scheduledMinutes ?? 0) / 60)}h ${(workloadSummary?.scheduledMinutes ?? 0) % 60}m`,
                      label: 'Planned',
                    },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-[#F3F7F3] rounded-xl p-3 text-center">
                      <div className="text-base font-black text-[#26352E]">{value}</div>
                      <div className="text-[8px] font-bold text-[#718078] uppercase tracking-wide mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#718078] mb-1.5">
                    <span>Focus capacity used</span>
                    <span className="font-bold text-[#315C4A]">
                      {Math.floor((workloadSummary?.remainingCapacityMinutes ?? 480) / 60)}h{' '}
                      {(workloadSummary?.remainingCapacityMinutes ?? 480) % 60}m free
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E8F0EA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#315C4A] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* What Matters Today */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#F3F7F3]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#718078]">Personal Goals Focus</p>
                <h3 className="text-lg font-black text-[#26352E] mt-0.5">What Matters Today?</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 size={15} className="text-[#315C4A]" />
                <span className="text-xs font-bold text-[#315C4A]">{topPriorities.length} items</span>
              </div>
            </div>

            {topPriorities.length > 0 ? (
              <div className="space-y-2">
                {topPriorities.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F3F7F3] border border-[#E8F0EA] transition-all hover:translate-x-1"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="w-5 h-5 rounded-md border border-[#A8BDAF] bg-white flex items-center justify-center hover:bg-[#E8F0EA] transition-colors flex-shrink-0"
                      >
                        {task.status === 'completed' && <CheckCircle2 size={14} className="text-[#315C4A]" />}
                      </button>
                      <span className="text-xs font-bold text-[#26352E] truncate">{task.title}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${priorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-[#718078]">No flexible tasks for today. Log one!</div>
            )}
          </Card>
        </div>

        {/* ── Right col ─────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Fixed Schedule */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3F7F3] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#718078]">Today</p>
                <h3 className="text-sm font-black text-[#26352E] mt-0.5">Fixed Schedule</h3>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#E8F0EA] flex items-center justify-center">
                <Calendar size={15} className="text-[#315C4A]" />
              </div>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div key={evt.id} className="p-3 bg-[#F3F7F3] border border-[#E8F0EA] rounded-xl flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#26352E] truncate">{evt.title}</span>
                    <span className="text-[9px] font-bold text-white bg-[#315C4A] px-1.5 py-0.5 rounded-full shrink-0">
                      FIXED
                    </span>
                  </div>
                  <span className="text-[10px] text-[#718078] font-semibold">
                    {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(evt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {evt.location && <span className="text-[9px] text-[#718078]">Room: {evt.location}</span>}
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-[#718078] text-center py-4">No fixed events today.</p>
              )}
            </div>
          </Card>

          {/* Finance Snapshot */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3F7F3] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#718078]">Money</p>
                <h3 className="text-sm font-black text-[#26352E] mt-0.5">Financial Snapshot</h3>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#E8F0EA] flex items-center justify-center">
                <Wallet size={15} className="text-[#315C4A]" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#F3F7F3] rounded-xl">
                <span className="text-xs text-[#718078] font-semibold">YTD Balance</span>
                <span className="text-sm font-black text-[#26352E]">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#F3F7F3] rounded-xl">
                <span className="text-xs text-[#718078] font-semibold">Next Rent Due</span>
                <span className="text-sm font-black text-[#26352E]">$495.00 (Sept 1)</span>
              </div>
            </div>
          </Card>

          {/* Wellness Snapshot */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3F7F3] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#718078]">Wellness</p>
                <h3 className="text-sm font-black text-[#26352E] mt-0.5">Apple Watch</h3>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#E8F0EA] flex items-center justify-center">
                <Dumbbell size={15} className="text-[#315C4A]" />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#718078] font-semibold">Hydration</span>
                  <span className="font-bold text-[#26352E]">{hydrationSummary?.currentTotalOz ?? 0} / 128 oz</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8F0EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#315C4A] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ((hydrationSummary?.currentTotalOz ?? 0) / 128) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#F3F7F3] rounded-xl">
                <span className="text-xs text-[#718078] font-semibold">Activity Rings</span>
                <span className="text-sm font-black text-[#315C4A]">70%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => { setIsAIDrawerOpen(false); setAiCommandMode(null) }}
        initialQuery={
          aiCommandMode === 'plan'       ? 'schedule'    :
          aiCommandMode === 'next'       ? 'next_action' :
          aiCommandMode === 'overwhelmed'? 'overwhelmed' :
          undefined
        }
      />
    </div>
  )
}
