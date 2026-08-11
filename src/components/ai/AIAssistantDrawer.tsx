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
      <div className="w-full max-w-md bg-[#faf8f3] dark:bg-[#2e2f22] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#d6c7ad] dark:border-[#5e6544]/40">
        {/* Drawer Header (Solid Bark Surface, NO GRADIENTS) */}
        <div className="p-4 md:p-5 bg-[#5e6544] text-[#faf8f3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2e2f22] rounded-xl text-[#b7c3a1]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-black text-base tracking-tight">AI Chief of Staff</h2>
              <p className="text-xs text-[#d6c7ad]">Calm & Empathetic Life Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#d6c7ad] hover:bg-[#2e2f22] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Query & Action Shortcuts */}
        <div className="p-4 border-b border-[#d6c7ad] dark:border-[#5e6544]/40 bg-[#f5e8d0]/60 dark:bg-[#23241a] space-y-2">
          <span className="text-[11px] font-bold text-[#8c947d] uppercase tracking-wider">
            What's on your mind?
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOverwhelmedTriage}
              className="p-2.5 rounded-xl border border-[#d6c7ad] dark:border-[#5e6544] bg-white dark:bg-[#2e2f22] hover:border-[#5e6544] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#5e6544] dark:text-[#faf8f3]"
            >
              <HeartHandshake size={16} className="text-[#5e6544]" /> I'm Overwhelmed
            </button>

            <button
              onClick={handleNextAction}
              className="p-2.5 rounded-xl border border-[#d6c7ad] dark:border-[#5e6544] bg-white dark:bg-[#2e2f22] hover:border-[#5e6544] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#2e2f22] dark:text-[#faf8f3]"
            >
              <Zap size={16} className="text-[#5e6544]" /> Next Action
            </button>

            <button
              onClick={handleAnalyzeSchedule}
              className="p-2.5 rounded-xl border border-[#d6c7ad] dark:border-[#5e6544] bg-white dark:bg-[#2e2f22] hover:border-[#5e6544] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#2e2f22] dark:text-[#faf8f3]"
            >
              <Calendar size={16} className="text-[#5e6544]" /> Today's Schedule
            </button>

            <button
              onClick={handleCheckWorkload}
              className="p-2.5 rounded-xl border border-[#d6c7ad] dark:border-[#5e6544] bg-white dark:bg-[#2e2f22] hover:border-[#5e6544] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#2e2f22] dark:text-[#faf8f3]"
            >
              <Clock size={16} className="text-[#5e6544]" /> Workload Check
            </button>

            <button
              onClick={handleCheckDeadlines}
              className="col-span-2 p-2.5 rounded-xl border border-[#d6c7ad] dark:border-[#5e6544] bg-white dark:bg-[#2e2f22] hover:border-[#5e6544] transition-all text-left flex items-center gap-2 text-xs font-bold text-[#2e2f22] dark:text-[#faf8f3]"
            >
              <AlertTriangle size={16} className="text-[#a85d48]" /> 7-Day Deadlines
            </button>
          </div>

          <Button
            onClick={handleOptimizeSchedule}
            fullWidth
            className="mt-2 bg-[#5e6544] hover:bg-[#2e2f22] text-[#faf8f3] font-bold text-xs"
            icon={<Sparkles size={16} />}
          >
            Auto-Optimize Today's Schedule
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#8c947d]">Processing query with AI engine...</div>
          ) : (
            <>
              {/* RESULTS: OVERWHELMED TRIAGE */}
              {activeQuery === 'overwhelmed' && overwhelmedSummary && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 bg-[#f5e8d0] dark:bg-[#23241a] rounded-xl text-xs font-bold text-[#5e6544] dark:text-[#faf8f3] flex items-center gap-2 border border-[#d6c7ad]">
                    <ShieldCheck size={18} />
                    <span>Take a deep breath. Here is your calm clarity plan for today:</span>
                  </div>

                  <Card className="p-4 space-y-3">
                    <h4 className="font-black text-xs text-[#5e6544] uppercase tracking-wider">
                      1. What Matters Today
                    </h4>
                    {overwhelmedSummary.whatMatters.map((t) => (
                      <div key={t.id} className="text-xs font-bold text-[#2e2f22] dark:text-[#faf8f3]">
                        • {t.title}
                      </div>
                    ))}

                    <h4 className="font-black text-xs text-[#8c947d] uppercase tracking-wider pt-2">
                      2. What Can Wait
                    </h4>
                    {overwhelmedSummary.whatCanWait.length > 0 ? (
                      overwhelmedSummary.whatCanWait.map((t) => (
                        <div key={t.id} className="text-xs text-[#8c947d]">
                          • {t.title} (No deadline)
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#8c947d]">Low priority items clear</div>
                    )}

                    <h4 className="font-black text-xs text-[#a85d48] uppercase tracking-wider pt-2">
                      3. Recommended Action
                    </h4>
                    {overwhelmedSummary.recommendedAction && (
                      <div className="p-2.5 bg-[#f5e8d0]/60 dark:bg-[#2e2f22] rounded-lg text-xs font-bold text-[#2e2f22] dark:text-[#faf8f3] border border-[#d6c7ad]">
                        {overwhelmedSummary.recommendedAction.title}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* RESULTS: NEXT ACTION */}
              {activeQuery === 'next_action' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#2e2f22] dark:text-[#faf8f3] flex items-center gap-2">
                    <Zap size={16} className="text-[#5e6544]" /> Highest Priority Action
                  </h3>
                  {nextAction ? (
                    <Card className="p-4 border-l-4 border-[#5e6544] space-y-2">
                      <h4 className="font-bold text-sm text-[#2e2f22] dark:text-[#faf8f3]">{nextAction.title}</h4>
                      <p className="text-xs text-[#8c947d]">
                        Priority: <span className="font-bold uppercase text-[#5e6544]">{nextAction.priority}</span> · Energy: {nextAction.energy_required}
                      </p>
                    </Card>
                  ) : (
                    <Card className="p-4 text-center text-xs text-[#8c947d]">No active priority tasks.</Card>
                  )}
                </div>
              )}

              {/* RESULTS: SCHEDULE */}
              {activeQuery === 'schedule' && todayData && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#2e2f22] dark:text-[#faf8f3] flex items-center gap-2">
                    <Calendar size={16} className="text-[#5e6544]" /> Today's Schedule Overview
                  </h3>
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#8c947d]">Fixed Commitments ({todayData.events.length})</div>
                    {todayData.events.map((e) => (
                      <Card key={e.id} className="p-3 text-xs flex justify-between items-center">
                        <span className="font-bold">{e.title}</span>
                        <span className="text-[#5e6544] font-bold">Fixed Calendar</span>
                      </Card>
                    ))}

                    <div className="text-xs font-bold text-[#8c947d] pt-2">Scheduled Tasks ({todayData.scheduledTasks.length})</div>
                    {todayData.scheduledTasks.map((t) => (
                      <Card key={t.id} className="p-3 text-xs flex justify-between items-center">
                        <span className="font-bold">{t.title}</span>
                        <span className="text-[#8c947d]">{t.estimated_minutes} mins</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* RESULTS: WORKLOAD */}
              {activeQuery === 'workload' && forecast && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#2e2f22] dark:text-[#faf8f3] flex items-center gap-2">
                    <Clock size={16} className="text-[#5e6544]" /> Workload Capacity
                  </h3>
                  <Card className="p-4 text-center space-y-2">
                    <div className="text-2xl font-black text-[#5e6544] dark:text-[#b7c3a1]">
                      {forecast.capacityStatus}
                    </div>
                    <div className="text-xs text-[#8c947d]">
                      {forecast.scheduledMinutes} mins scheduled of {forecast.availableCapacityMinutes} mins daily capacity ({forecast.percentageCapacityUsed}%)
                    </div>
                  </Card>
                </div>
              )}

              {/* RESULTS: DEADLINES */}
              {activeQuery === 'deadlines' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#2e2f22] dark:text-[#faf8f3] flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#a85d48]" /> Upcoming 7-Day Deadlines
                  </h3>
                  {deadlines.length > 0 ? (
                    <div className="space-y-2">
                      {deadlines.map((t) => (
                        <Card key={t.id} className="p-3 text-xs flex justify-between items-center">
                          <span className="font-bold truncate">{t.title}</span>
                          <span className="text-[#a85d48] font-bold">
                            {new Date(t.deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-4 text-center text-xs text-[#8c947d]">No imminent deadlines within 7 days.</Card>
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
