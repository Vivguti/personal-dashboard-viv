import { CheckSquare, Clock, Zap, Calendar, Trash2, Edit2 } from 'lucide-react'
import type { Task } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { PRIORITY_CONFIG } from '@/lib/constants'

export interface TaskCardProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed'
  const priorityInfo = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium

  const formatDeadline = (iso: string | null) => {
    if (!iso) return null
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high': return 'text-[#a85d48] bg-[#f5e8d0] dark:bg-[#2e2f22] dark:text-[#f5e8d0]'
      case 'low': return 'text-[#5e6544] bg-[#f5e8d0] dark:bg-[#2e2f22] dark:text-[#b7c3a1]'
      default: return 'text-[#8c947d] bg-[#f5e8d0] dark:bg-[#2e2f22] dark:text-[#b7c3a1]'
    }
  }

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-[#faf8f3]/60 dark:bg-[#23241a]/40 border-[#d6c7ad] dark:border-[#5e6544]/30 opacity-75'
          : 'bg-white dark:bg-[#23241a] border-[#d6c7ad] dark:border-[#5e6544]/40 shadow-xs hover:border-[#5e6544]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
            isCompleted
              ? 'bg-emerald-700 border-emerald-700 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-emerald-600'
          }`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted && <CheckSquare className="w-4 h-4" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-semibold text-base leading-snug truncate ${
                isCompleted
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {task.title}
            </h3>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
                  aria-label="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Badges & Meta Pill Row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/60 text-xs">
            {/* Priority */}
            <Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' : 'default'} size="sm">
              {priorityInfo.label}
            </Badge>

            {/* Energy */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${getEnergyColor(task.energy_required)}`}>
              <Zap className="w-3 h-3" />
              {task.energy_required.toUpperCase()}
            </span>

            {/* Estimated vs Actual Minutes */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
              <Clock className="w-3 h-3" />
              {task.actual_minutes ? `${task.actual_minutes} / ` : ''}{task.estimated_minutes ?? 30}m
            </span>

            {/* Deadline */}
            {task.deadline && (
              <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3 text-emerald-600" />
                {formatDeadline(task.deadline)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
