import type { WorkloadSummary } from '@/types'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Clock, AlertTriangle, Zap } from 'lucide-react'

export interface WorkloadWidgetProps {
  summary: WorkloadSummary
}

export function WorkloadWidget({ summary }: WorkloadWidgetProps) {
  const getCapacityColor = (status: WorkloadSummary['capacityStatus']) => {
    switch (status) {
      case 'Balanced': return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
      case 'Busy': return 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
      case 'Near Capacity': return 'text-orange-700 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-300'
      case 'Overloaded': return 'text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300'
    }
  }

  const formatHours = (minutes: number) => {
    const hrs = (minutes / 60).toFixed(1)
    return `${hrs}h`
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg text-emerald-700 dark:text-emerald-300">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Workload & Capacity ({summary.periodLabel})
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatHours(summary.remainingMinutes)} remaining of {formatHours(summary.availableCapacityMinutes)} capacity
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getCapacityColor(summary.capacityStatus)}`}>
          {summary.capacityStatus}
        </span>
      </div>

      {/* Capacity Progress Bar */}
      <div className="mt-4">
        <ProgressBar value={summary.percentageCapacityUsed} />
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          <span>{summary.percentageCapacityUsed}% Used</span>
          <span>{formatHours(summary.remainingCapacityMinutes)} available</span>
        </div>
      </div>

      {/* Overdue Warning */}
      {summary.overdueMinutes > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{formatHours(summary.overdueMinutes)} of workload is overdue.</span>
        </div>
      )}

      {/* Energy Breakdown */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
        <div className="text-center p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30">
          <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
            <Zap size={12} /> Low
          </div>
          <div className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">
            {formatHours(summary.energyBreakdown.low)}
          </div>
        </div>

        <div className="text-center p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30">
          <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
            <Zap size={12} /> Med
          </div>
          <div className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">
            {formatHours(summary.energyBreakdown.medium)}
          </div>
        </div>

        <div className="text-center p-2 rounded-lg bg-red-50/70 dark:bg-red-950/30">
          <div className="flex items-center justify-center gap-1 text-red-700 dark:text-red-300 font-medium">
            <Zap size={12} /> High
          </div>
          <div className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">
            {formatHours(summary.energyBreakdown.high)}
          </div>
        </div>
      </div>
    </Card>
  )
}
