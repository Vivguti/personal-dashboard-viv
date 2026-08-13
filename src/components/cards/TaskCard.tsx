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
      case 'high': return 'text-[#a85d48] bg-[#a85d48]/10'
      case 'low': return 'text-[#315C4A] bg-[#E8F0EA]'
      default: return 'text-[#718078] bg-[#F3F7F3]'
    }
  }

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-[#F3F7F3]/70 border-[#E8F0EA] opacity-75'
          : 'bg-white border-[#E8F0EA] shadow-xs hover:border-[#A8BDAF]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
            isCompleted
              ? 'bg-[#315C4A] border-[#315C4A] text-white'
              : 'border-[#A8BDAF] hover:border-[#315C4A] text-transparent'
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
                  ? 'line-through text-[#718078]'
                  : 'text-[#26352E]'
              }`}
            >
              {task.title}
            </h3>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {onEdit && (
                <button
                   onClick={() => onEdit(task)}
                   className="p-1 text-[#718078] hover:text-[#26352E] rounded transition-all"
                   aria-label="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                   onClick={() => onDelete(task)}
                   className="p-1 text-[#718078] hover:text-[#a85d48] rounded transition-all"
                   aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-[#718078] mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Badges & Meta Pill Row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-[#F3F7F3] text-xs">
            {/* Priority */}
            <Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' : 'default'} size="sm">
              {priorityInfo.label}
            </Badge>

            {/* Energy */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium ${getEnergyColor(task.energy_required)}`}>
              <Zap className="w-3 h-3" />
              {task.energy_required.toUpperCase()}
            </span>

            {/* Estimated vs Actual Minutes */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3F7F3] text-[#718078] font-medium">
              <Clock className="w-3 h-3" />
              {task.actual_minutes ? `${task.actual_minutes} / ` : ''}{task.estimated_minutes ?? 30}m
            </span>

            {/* Deadline */}
            {task.deadline && (
              <span className="inline-flex items-center gap-1 text-[#718078]">
                <Calendar className="w-3 h-3 text-[#315C4A]" />
                {formatDeadline(task.deadline)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
