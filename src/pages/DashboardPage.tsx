import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

import {
  Sparkles, CheckCircle2, Wallet, Dumbbell, AlertTriangle
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

// ─── Full Green Palette ───────────────────────────────────────────────────────
// Canvas   #eef1eb  very light sage  — page background
// Chip     #dfe8db  sage-green tile  — stat chips, tiles, task rows
// Border   #c4cfbc  sage-green line  — borders, dividers, tracks
// Olive    #b7c3a1  muted olive      — softer accents, secondary dots
// Sage     #8c947d  medium sage      — icons, labels, header bar = logo color
// Bark     #5e6544  dark green       — CTAs, hero bg, graph fills
// Dark     #2e2f22  near-black green — headings, primary text
// White    #ffffff  card surfaces
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

  const getGreetingPhrase = () => {
    const balance = capacityPercent <= 70
    if (balance) return "You're looking balanced today."
    return "Let's focus on what matters."
  }

  const todayDateString = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // Highlight only the top 3 priorities for Viv to reduce cognitive overload
  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const topPriorities = pendingTasks.slice(0, 3)

  const capacityPercent = workloadSummary?.percentageCapacityUsed ?? 45
  const capacityStatus = workloadSummary?.capacityStatus ?? 'Balanced'

  const priorityBadge = (p: string) => {
    if (p === 'critical') return 'bg-[#a85d48]/10 text-[#a85d48] border-[#a85d48]/30'
    if (p === 'high')     return 'bg-[#5e6544]/15 text-[#5e6544] border-[#8c947d]/40'
    if (p === 'medium')   return 'bg-[#b7c3a1]/40 text-[#5e6544] border-[#b7c3a1]'
    return 'bg-[#dfe8db] text-[#8c947d] border-[#c4cfbc]'
  }

  // Active Schedule overlap conflict check
  const getTodayConflicts = () => {
    const conflicts: string[] = []
    const sorted = [...events].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i]
        const b = sorted[j]
        if (a && b) {
          const aStart = new Date(a.start_time).getTime()
          const aEnd = new Date(a.end_time).getTime()
          const bStart = new Date(b.start_time).getTime()
          const bEnd = new Date(b.end_time).getTime()
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
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in bg-[#FBFAF6]">

      {/* ── 1. HERO GREETING ─────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#c4cfbc]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#8c947d] mb-1">
            {todayDateString}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-[#2e2f22] tracking-tight leading-tight">
            {getGreeting()}, Viv.
          </h1>
          <p className="text-sm text-[#8c947d] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5e6544] inline-block animate-pulse" />
            {getGreetingPhrase()} Workload is <strong className="text-[#5e6544]">{capacityStatus.toLowerCase()}</strong> today.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setAiCommandMode('plan')
            setIsAIDrawerOpen(true)
          }}
          className="bg-[#5e6544] hover:bg-[#2e2f22] text-white border-none shadow-sm font-semibold"
          icon={<Sparkles size={14} />}
        >
          Plan My Day
        </Button>
      </header>

      {/* ── 2. WORK/SCHOOL CONFLICTS ALERT ────────────────────────────── */}
      {!isConflictDismissed && todayConflicts.length > 0 && (
        <div className="bg-[#a85d48]/10 border border-[#a85d48]/30 rounded-2xl p-4 space-y-3 text-[#a85d48] text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle size={16} />
            <span>WORK SCHEDULE CONFLICT</span>
          </div>
          <p className="leading-relaxed">
            Your schedule contains overlapping commitments today:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {todayConflicts.map((c, idx) => <li key={idx} className="font-semibold">{c}</li>)}
          </ul>
          <div className="flex gap-2 pt-1">
            <button onClick={handleDismissConflict} className="px-3 py-1.5 bg-[#a85d48] text-white font-bold rounded-xl text-[10px] hover:bg-[#2e2f22] transition-colors">
              Resolve
            </button>
            <button onClick={handleDismissConflict} className="px-3 py-1.5 bg-white text-[#a85d48] border border-[#a85d48]/30 font-bold rounded-xl text-[10px] hover:bg-[#a85d48]/10 transition-colors">
              Keep Both
            </button>
            <button onClick={handleDismissConflict} className="px-3 py-1.5 bg-white text-[#a85d48] border border-[#a85d48]/30 font-bold rounded-xl text-[10px] hover:bg-[#a85d48]/10 transition-colors">
              Adjust Work
            </button>
          </div>
        </div>
      )}

      {/* ── 3. AI QUICK-ENTRY STRIP ──────────────────────────────────────── */}
      <div className="bg-white border border-[#c4cfbc] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#5e6544] flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2e2f22]">What's on your mind, Viv?</p>
            <p className="text-xs text-[#8c947d]">AI Command Center</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { emoji: '✨', label: 'Plan my day', mode: 'plan' as const },
            { emoji: '🧘', label: "I'm overwhelmed", mode: 'overwhelmed' as const },
            { emoji: '⚡', label: "What's next?", mode: 'next' as const },
          ].map(({ emoji, label, mode }) => (
            <button
              key={label}
              onClick={() => {
                setAiCommandMode(mode)
                setIsAIDrawerOpen(true)
              }}
              className="px-3 py-1.5 rounded-lg bg-[#dfe8db] border border-[#c4cfbc] text-xs font-semibold text-[#5e6544] hover:bg-[#c4cfbc] hover:border-[#b7c3a1] transition-all"
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. MAIN DASHBOARD CONTENT ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Today's Priorities & Capacity */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's Overview Command Center */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c947d]">Daily Command Center</p>
                <h2 className="text-lg font-black text-[#2e2f22] mt-0.5">Today's Overview</h2>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                capacityStatus === 'Balanced'   ? 'bg-[#b7c3a1]/30 text-[#5e6544] border-[#b7c3a1]'    :
                capacityStatus === 'Busy'       ? 'bg-[#dfe8db] text-[#5e6544] border-[#c4cfbc]'        :
                'bg-[#a85d48]/10 text-[#a85d48] border-[#a85d48]/30'
              }`}>
                {capacityStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* SVG Ring */}
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#c4cfbc" strokeWidth="3" />
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
                    <span className="text-xl font-black text-[#2e2f22]">{capacityPercent}%</span>
                    <span className="text-[8px] font-bold text-[#8c947d] uppercase tracking-wide">capacity</span>
                  </div>
                </div>
              </div>

              {/* Stats + bar */}
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
                    <div key={label} className="bg-[#dfe8db] rounded-xl p-3 text-center">
                      <div className="text-base font-black text-[#2e2f22]">{value}</div>
                      <div className="text-[8px] font-bold text-[#8c947d] uppercase tracking-wide mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#8c947d] mb-1">
                    <span>Focus capacity used</span>
                    <span className="font-bold text-[#5e6544]">
                      {Math.floor((workloadSummary?.remainingCapacityMinutes ?? 480) / 60)}h{' '}
                      {(workloadSummary?.remainingCapacityMinutes ?? 480) % 60}m free
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#c4cfbc] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5e6544] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* WHAT MATTERS TODAY - Restrict to Top 3 flexible priorities for Viv */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c947d]">Personal Goals Focus</p>
                <h3 className="text-lg font-black text-[#2e2f22] mt-0.5">What Matters Today?</h3>
              </div>
              <span className="text-xs font-bold text-[#5e6544]">{topPriorities.length} items</span>
            </div>

            {topPriorities.length > 0 ? (
              <div className="space-y-2">
                {topPriorities.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#dfe8db] border border-[#c4cfbc] transition-all hover:translate-x-1"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="w-5 h-5 rounded-md border border-[#8c947d] bg-white flex items-center justify-center hover:bg-[#dfe8db] transition-colors"
                      >
                        {task.status === 'completed' && <CheckCircle2 size={14} className="text-[#5e6544]" />}
                      </button>
                      <span className="text-xs font-bold text-[#2e2f22] truncate">{task.title}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${priorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#8c947d]">No flexible tasks for today. Log one!</div>
            )}
          </Card>
        </div>

        {/* Column 3: Daily Timeline / Next Event / Finance Snapshot */}
        <div className="space-y-6">

          {/* Today's Classes & Shifts Event widget */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-black text-[#2e2f22] uppercase tracking-wider border-b border-[#dfe8db] pb-2">
              Today's Fixed Schedule
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div key={evt.id} className="p-3 bg-[#dfe8db] border border-[#c4cfbc] rounded-xl flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#2e2f22] truncate">{evt.title}</span>
                    <span className="text-[9px] font-bold text-white bg-[#315C4A] px-1.5 py-0.5 rounded-full shrink-0">
                      FIXED
                    </span>
                  </div>
                  <span className="text-[10px] text-[#5e6544] font-semibold">
                    {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(evt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {evt.location && <span className="text-[9px] text-[#718078]">Room: {evt.location}</span>}
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-[#8c947d] text-center py-4">No fixed events scheduled for today.</p>
              )}
            </div>
          </Card>

          {/* Finance Snapshot Card */}
          <Card className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#dfe8db] pb-2">
              <h3 className="text-sm font-black text-[#2e2f22] uppercase tracking-wider">Financial Snapshot</h3>
              <Wallet size={16} className="text-[#8c947d]" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#8c947d]">YTD Balance:</span>
                <span className="font-bold text-[#2e2f22]">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8c947d]">Next Rent Due:</span>
                <span className="font-bold text-[#a85d48]">$495.00 (Sept 1)</span>
              </div>
            </div>
          </Card>

          {/* Apple Watch/Health widget */}
          <Card className="p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-[#dfe8db] pb-2">
              <h3 className="text-sm font-black text-[#2e2f22] uppercase tracking-wider">Apple Watch Link</h3>
              <Dumbbell size={16} className="text-[#8c947d]" />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8c947d]">Hydration:</span>
              <span className="font-bold text-[#2e2f22]">{hydrationSummary?.currentTotalOz ?? 0} / 128 oz</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8c947d]">Activity Rings:</span>
              <span className="font-bold text-[#5e6544]">70% completed</span>
            </div>
          </Card>
        </div>
      </div>

      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => {
          setIsAIDrawerOpen(false)
          setAiCommandMode(null)
        }}
        initialQuery={
          aiCommandMode === 'plan' ? 'schedule' :
          aiCommandMode === 'next' ? 'next_action' :
          aiCommandMode === 'overwhelmed' ? 'overwhelmed' :
          undefined
        }
      />
    </div>
  )
}
