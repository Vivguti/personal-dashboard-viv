import { useState } from 'react'
import { Sparkles, Check, X, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { applyProposedSchedule, type AIActionProposal } from '@/services/aiAssistantService'

export interface ActionConfirmationCardProps {
  proposal: AIActionProposal
  onApplied?: () => void
  onDismissed?: () => void
}

export function ActionConfirmationCard({
  proposal,
  onApplied,
  onDismissed,
}: ActionConfirmationCardProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const handleApprove = async () => {
    setIsApplying(true)
    const success = await applyProposedSchedule(proposal)
    setIsApplying(false)

    if (success) {
      setApplied(true)
      if (onApplied) onApplied()
    }
  }

  if (applied) {
    return (
      <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
        <Check size={16} /> Schedule optimization plan applied successfully!
      </Card>
    )
  }

  return (
    <Card className="p-5 border-2 border-emerald-600/30 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-emerald-700 text-white rounded-xl">
          <Sparkles size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              AI Action Proposal (Requires Confirmation)
            </span>
          </div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-0.5">{proposal.title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{proposal.description}</p>
        </div>
      </div>

      {/* Proposed Time Blocks */}
      {proposal.blocks.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Proposed Schedule Adjustments:
          </span>
          <div className="space-y-1.5">
            {proposal.blocks.map((block) => (
              <div
                key={block.taskId}
                className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate flex-1 pr-2">
                  {block.taskTitle}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Confirmation Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/60">
        <Button variant="ghost" size="sm" onClick={onDismissed} icon={<X size={14} />}>
          Dismiss
        </Button>
        <Button size="sm" onClick={handleApprove} isLoading={isApplying} icon={<Check size={14} />}>
          Approve & Apply Action
        </Button>
      </div>
    </Card>
  )
}
