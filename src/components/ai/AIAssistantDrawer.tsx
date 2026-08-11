import { useState } from 'react'
import { Sparkles, X, Clock, Calendar, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ActionConfirmationCard } from '@/components/ai/ActionConfirmationCard'
import {
  getTodaySchedule,
  getWorkloadForecast,
  getUpcomingDeadlines,
  getNextAction,
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
      <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-gray-200 dark:border-gray-800">
        {/* Drawer Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/80 rounded-xl text-emerald-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base">AI Planning Assistant</h2>
              <p className="text-xs text-emerald-200">Personal OS Workload Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:bg-emerald-800/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Query & Action Shortcuts */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quick Assistant Tools</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleNextAction}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-600 dark:hover:border-emerald-600 transition-all text-left flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200"
            >
              <Zap size={16} className="text-emerald-600" /> Next Action
            </button>

            <button
              onClick={handleAnalyzeSchedule}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-600 dark:hover:border-emerald-600 transition-all text-left flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200"
            >
              <Calendar size={16} className="text-blue-600" /> Today's Schedule
            </button>

            <button
              onClick={handleCheckWorkload}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-600 dark:hover:border-emerald-600 transition-all text-left flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200"
            >
              <Clock size={16} className="text-purple-600" /> Workload Check
            </button>

            <button
              onClick={handleCheckDeadlines}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-600 dark:hover:border-emerald-600 transition-all text-left flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200"
            >
              <AlertTriangle size={16} className="text-amber-600" /> 7-Day Deadlines
            </button>
          </div>

          <Button
            onClick={handleOptimizeSchedule}
            fullWidth
            className="mt-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
            icon={<Sparkles size={16} />}
          >
            Auto-Optimize Today's Schedule
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">Processing query with AI engine...</div>
          ) : (
            <>
              {/* RESULTS: NEXT ACTION */}
              {activeQuery === 'next_action' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Zap size={16} className="text-emerald-600" /> Highest Priority Action
                  </h3>
                  {nextAction ? (
                    <Card className="p-4 border-l-4 border-emerald-600 space-y-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{nextAction.title}</h4>
                      <p className="text-xs text-gray-500">
                        Priority: <span className="font-bold uppercase text-emerald-700">{nextTaskPriorityLabel(nextAction.priority)}</span> · Energy: {nextAction.energy_required}
                      </p>
                    </Card>
                  ) : (
                    <Card className="p-4 text-center text-xs text-gray-500">No active priority tasks.</Card>
                  )}
                </div>
              )}

              {/* RESULTS: SCHEDULE */}
              {activeQuery === 'schedule' && todayData && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" /> Today's Schedule Overview
                  </h3>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500">Fixed Commitments ({todayData.events.length})</div>
                    {todayData.events.map((e) => (
                      <Card key={e.id} className="p-3 text-xs flex justify-between items-center">
                        <span className="font-semibold">{e.title}</span>
                        <span className="text-emerald-700 font-bold">Fixed Calendar</span>
                      </Card>
                    ))}

                    <div className="text-xs font-semibold text-gray-500 pt-2">Scheduled Tasks ({todayData.scheduledTasks.length})</div>
                    {todayData.scheduledTasks.map((t) => (
                      <Card key={t.id} className="p-3 text-xs flex justify-between items-center">
                        <span className="font-semibold">{t.title}</span>
                        <span className="text-gray-500">{t.estimated_minutes} mins</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* RESULTS: WORKLOAD */}
              {activeQuery === 'workload' && forecast && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Clock size={16} className="text-purple-600" /> Workload Capacity
                  </h3>
                  <Card className="p-4 text-center space-y-2">
                    <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">
                      {forecast.capacityStatus}
                    </div>
                    <div className="text-xs text-gray-500">
                      {forecast.scheduledMinutes} mins scheduled of {forecast.availableCapacityMinutes} mins daily capacity ({forecast.percentageCapacityUsed}%)
                    </div>
                  </Card>
                </div>
              )}

              {/* RESULTS: DEADLINES */}
              {activeQuery === 'deadlines' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-600" /> Upcoming 7-Day Deadlines
                  </h3>
                  {deadlines.length > 0 ? (
                    <div className="space-y-2">
                      {deadlines.map((t) => (
                        <Card key={t.id} className="p-3 text-xs flex justify-between items-center">
                          <span className="font-semibold truncate">{t.title}</span>
                          <span className="text-amber-600 font-bold">
                            {new Date(t.deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-4 text-center text-xs text-gray-500">No imminent deadlines within 7 days.</Card>
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

function nextTaskPriorityLabel(priority: string) {
  return priority.toUpperCase()
}
