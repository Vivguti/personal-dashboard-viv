import { useState, useEffect } from 'react'
import { Sparkles, CheckCircle, Clock, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getNextAction } from '@/services/aiAssistantService'
import { toggleTaskComplete } from '@/services/tasksService'
import type { Task } from '@/types'

export function NextActionWidget() {
  const [nextTask, setNextTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshNextAction = async () => {
    try {
      setIsLoading(true)
      const task = await getNextAction()
      setNextTask(task)
    } catch (err) {
      console.error('Error fetching next action:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshNextAction()
  }, [])

  const handleComplete = async () => {
    if (!nextTask) return
    await toggleTaskComplete(nextTask.id, true)
    refreshNextAction()
  }

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white border-none shadow-md">
        <div className="text-xs text-emerald-200">AI Evaluating Priorities...</div>
      </Card>
    )
  }

  if (!nextTask) {
    return (
      <Card className="p-5 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white border-none shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-800/80 rounded-xl text-emerald-300">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">AI Priority Engine</span>
            <h3 className="text-sm font-semibold">All clear! No pending tasks remaining today.</h3>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5 bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-950 text-white border-none shadow-lg relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
        <Sparkles size={160} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-700/80 text-emerald-100 flex items-center gap-1">
              <Zap size={10} /> #1 Next Action Right Now
            </span>
            {nextTask.priority === 'critical' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/80 text-white">
                Critical Deadline
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold tracking-tight text-white">{nextTask.title}</h3>

          <div className="flex items-center gap-4 text-xs text-emerald-200 pt-0.5">
            {nextTask.estimated_minutes && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {nextTask.estimated_minutes} mins estimated
              </span>
            )}
            {nextTask.deadline && (
              <span>Due: {new Date(nextTask.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>

        <Button
          onClick={handleComplete}
          className="bg-white text-emerald-900 hover:bg-emerald-50 border-none font-bold text-xs shadow-md whitespace-nowrap"
          icon={<CheckCircle size={16} className="text-emerald-700" />}
        >
          Mark Complete
        </Button>
      </div>
    </Card>
  )
}
