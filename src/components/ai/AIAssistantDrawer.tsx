import { useState } from 'react'
import { Sparkles, X, Clock, Calendar, Zap, ShieldCheck, HeartHandshake, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ActionConfirmationCard } from '@/components/ai/ActionConfirmationCard'
import {
  getTodaySchedule,
  getWorkloadForecast,
  getUpcomingDeadlines,
  getNextAction,
  getPendingTasks,
  proposeScheduleOptimization,
  type AIActionProposal,
} from '@/services/aiAssistantService'
import type { Task, CalendarEvent, WorkloadSummary } from '@/types'

export interface AIAssistantDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistantDrawer({ isOpen, onClose }: AIAssistantDrawerProps) {
  const [activeQuery, setActiveQuery] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Result States
  const [todayData, setTodayData] = useState<{ events: CalendarEvent[]; scheduledTasks: Task[] } | null>(null)
  const [forecast, setForecast] = useState<WorkloadSummary | null>(null)
  const [deadlines, setDeadlines] = useState<Task[]>([])
  const [nextAction, setNextAction] = useState<Task | null>(null)
  const [proposal, setProposal] = useState<AIActionProposal | null>(null)

  // Overwhelmed Triage State
  const [overwhelmedSummary, setOverwhelmedSummary] = useState<{
    whatMatters: Task[]
    whatCanWait: Task[]
    whatShouldMove: Task[]
    recommendedAction: Task | null
  } | null>(null)

  if (!isOpen) return null

  const handleAnalyzeSchedule = async () => {
    try {
      setIsLoading(true)
      setActiveQuery('schedule')
      const data = await getTodaySchedule()
      setTodayData(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextAction = async () => {
    try {
      setIsLoading(true)
      setActiveQuery('next_action')
      const task = await getNextAction()
      setNextAction(task)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckWorkload = async () => {
    try {
      setIsLoading(true)
      setActiveQuery('workload')
      const summary = await getWorkloadForecast()
      setForecast(summary)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckDeadlines = async () => {
    try {
      setIsLoading(true)
      setActiveQuery('deadlines')
      const items = await getUpcomingDeadlines()
      setDeadlines(items)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOverwhelmedTriage = async () => {
    try {
      setIsLoading(true)
      setActiveQuery('overwhelmed')
      const pending = await getPendingTasks()

      const whatMatters = pending.filter((t) => t.priority === 'critical' || t.priority === 'high').slice(0, 2)
      const whatCanWait = pending.filter((t) => t.priority === 'low')
      const whatShouldMove = pending.filter((t) => t.priority === 'medium' && !t.deadline).slice(0, 2)
      const recommendedAction = pending[0] ?? null

      setOverwhelmedSummary({
        whatMatters,
        whatCanWait,
        whatShouldMove,
        recommendedAction,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimizeSchedule = async () => {
    try {
      setIsLoading(true)
      setActiveQuery('optimize')
      const plan = await proposeScheduleOptimization()
      setProposal(plan)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#fbfaf6] dark:bg-[#121b17] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#dce5de] dark:border-[#26352e]">
        {/* Drawer Header */}
        <div className="p-4 md:p-5 bg-[#315c4a] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#26352e] rounded-xl text-[#a8bdaf]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">AI Chief of Staff</h2>
              <p className="text-xs text-[#a8bdaf]">Calm & Empathetic Life Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#a8bdaf] hover:bg-[#26352e] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Query & Action Shortcuts */}
        <div className="p-4 border-b border-[#dce5de] dark:border-[#26352e] bg-[#f3f7f3] dark:bg-[#1c2722] space-y-2">
          <span className="text-[11px] font-bold text-[#718078] uppercase tracking-wider">
            What's on your mind?
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOverwhelmedTriage}
              className="p-2.5 rounded-xl border border-[#dce5de] dark:border-[#315c4a] bg-white dark:bg-[#121b17] hover:border-[#315c4a] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#315c4a] dark:text-[#f3f7f3]"
            >
              <HeartHandshake size={16} className="text-[#315c4a]" /> I'm Overwhelmed
            </button>

            <button
              onClick={handleNextAction}
              className="p-2.5 rounded-xl border border-[#dce5de] dark:border-[#315c4a] bg-white dark:bg-[#121b17] hover:border-[#315c4a] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#26352e] dark:text-[#f3f7f3]"
            >
              <Zap size={16} className="text-[#315c4a]" /> Next Action
            </button>

            <button
              onClick={handleAnalyzeSchedule}
              className="p-2.5 rounded-xl border border-[#dce5de] dark:border-[#315c4a] bg-white dark:bg-[#121b17] hover:border-[#315c4a] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#26352e] dark:text-[#f3f7f3]"
            >
              <Calendar size={16} className="text-blue-600" /> Today's Schedule
            </button>

            <button
              onClick={handleCheckWorkload}
              className="p-2.5 rounded-xl border border-[#dce5de] dark:border-[#315c4a] bg-white dark:bg-[#121b17] hover:border-[#315c4a] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#26352e] dark:text-[#f3f7f3]"
            >
              <Clock size={16} className="text-purple-600" /> Workload Check
            </button>

            <button
              onClick={handleCheckDeadlines}
              className="p-2.5 rounded-xl border border-[#dce5de] dark:border-[#315c4a] bg-white dark:bg-[#121b17] hover:border-[#315c4a] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#26352e] dark:text-[#f3f7f3]"
            >
              <AlertTriangle size={16} className="text-amber-600" /> 7-Day Deadlines
            </button>
          </div>

          <Button
            onClick={handleOptimizeSchedule}
            fullWidth
            className="mt-2 bg-[#315c4a] hover:bg-[#26352e] text-white font-bold text-xs"
            icon={<Sparkles size={16} />}
          >
            Auto-Optimize Today's Schedule
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#718078]">Processing query with AI engine...</div>
          ) : (
            <>
              {/* RESULTS: OVERWHELMED TRIAGE */}
              {activeQuery === 'overwhelmed' && overwhelmedSummary && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 bg-[#e8f0ea] dark:bg-[#26352e] rounded-xl text-xs font-bold text-[#315c4a] dark:text-[#f3f7f3] flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>Take a deep breath. Here is your calm clarity plan for today:</span>
                  </div>

                  <Card className="p-4 space-y-3">
                    <h4 className="font-extrabold text-xs text-[#315c4a] uppercase tracking-wider">
                      1. What Matters Today
                    </h4>
                    {overwhelmedSummary.whatMatters.map((t) => (
                      <div key={t.id} className="text-xs font-bold text-[#26352e] dark:text-[#f3f7f3]">
                        • {t.title}
                      </div>
                    ))}

                    <h4 className="font-extrabold text-xs text-[#718078] uppercase tracking-wider pt-2">
                      2. What Can Wait
                    </h4>
                    {overwhelmedSummary.whatCanWait.length > 0 ? (
                      overwhelmedSummary.whatCanWait.map((t) => (
                        <div key={t.id} className="text-xs text-[#718078]">
                          • {t.title} (No deadline)
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#718078]">Low priority items clear</div>
                    )}

                    <h4 className="font-extrabold text-xs text-amber-700 uppercase tracking-wider pt-2">
                      3. Recommended Action
                    </h4>
                    {overwhelmedSummary.recommendedAction && (
                      <div className="p-2.5 bg-[#f3f7f3] dark:bg-[#121b17] rounded-lg text-xs font-bold text-[#26352e] dark:text-[#f3f7f3]">
                        {overwhelmedSummary.recommendedAction.title}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* RESULTS: NEXT ACTION */}
              {activeQuery === 'next_action' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#26352e] dark:text-[#f3f7f3] flex items-center gap-2">
                    <Zap size={16} className="text-[#315c4a]" /> Highest Priority Action
                  </h3>
                  {nextAction ? (
                    <Card className="p-4 border-l-4 border-[#315c4a] space-y-2">
                      <h4 className="font-bold text-sm text-[#26352e] dark:text-[#f3f7f3]">{nextAction.title}</h4>
                      <p className="text-xs text-[#718078]">
                        Priority: <span className="font-bold uppercase text-[#315c4a]">{nextAction.priority}</span> · Energy: {nextAction.energy_required}
                      </p>
                    </Card>
                  ) : (
                    <Card className="p-4 text-center text-xs text-[#718078]">No active priority tasks.</Card>
                  )}
                </div>
              )}

              {/* RESULTS: SCHEDULE */}
              {activeQuery === 'schedule' && todayData && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#26352e] dark:text-[#f3f7f3] flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" /> Today's Schedule Overview
                  </h3>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#718078]">Fixed Commitments ({todayData.events.length})</div>
                    {todayData.events.map((e) => (
                      <Card key={e.id} className="p-3 text-xs flex justify-between items-center">
                        <span className="font-semibold">{e.title}</span>
                        <span className="text-[#315c4a] font-bold">Fixed Calendar</span>
                      </Card>
                    ))}

                    <div className="text-xs font-semibold text-[#718078] pt-2">Scheduled Tasks ({todayData.scheduledTasks.length})</div>
                    {todayData.scheduledTasks.map((t) => (
                      <Card key={t.id} className="p-3 text-xs flex justify-between items-center">
                        <span className="font-semibold">{t.title}</span>
                        <span className="text-[#718078]">{t.estimated_minutes} mins</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* RESULTS: WORKLOAD */}
              {activeQuery === 'workload' && forecast && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#26352e] dark:text-[#f3f7f3] flex items-center gap-2">
                    <Clock size={16} className="text-purple-600" /> Workload Capacity
                  </h3>
                  <Card className="p-4 text-center space-y-2">
                    <div className="text-2xl font-extrabold text-[#315c4a] dark:text-[#a8bdaf]">
                      {forecast.capacityStatus}
                    </div>
                    <div className="text-xs text-[#718078]">
                      {forecast.scheduledMinutes} mins scheduled of {forecast.availableCapacityMinutes} mins daily capacity ({forecast.percentageCapacityUsed}%)
                    </div>
                  </Card>
                </div>
              )}

              {/* RESULTS: DEADLINES */}
              {activeQuery === 'deadlines' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#26352e] dark:text-[#f3f7f3] flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-600" /> Upcoming 7-Day Deadlines
                  </h3>
                  {deadlines.length > 0 ? (
                    <div className="space-y-2">
                      {deadlines.map((t) => (
                        <Card key={t.id} className="p-3 text-xs flex justify-between items-center">
                          <span className="font-semibold truncate">{t.title}</span>
                          <span className="text-amber-700 font-bold">
                            {new Date(t.deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-4 text-center text-xs text-[#718078]">No imminent deadlines within 7 days.</Card>
                  )}
                </div>
              )}

              {/* RESULTS: OPTIMIZATION PROPOSAL */}
              {activeQuery === 'optimize' && proposal && (
                <ActionConfirmationCard proposal={proposal} onApplied={() => setActiveQuery(null)} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
