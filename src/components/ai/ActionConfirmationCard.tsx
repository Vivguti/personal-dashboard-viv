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
      <Card className="p-4 bg-[#d6c7ad] border border-[#b7c3a1] text-[#2e2f22] text-xs font-bold flex items-center gap-2">
        <Check size={16} /> Schedule optimization plan applied successfully!
      </Card>
    )
  }

  return (
    <Card className="p-5 border-2 border-[#d6c7ad] bg-[#f5e8d0] dark:bg-[#23241a] space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#d6c7ad] text-[#2e2f22] border border-[#b7c3a1] rounded-xl">
          <Sparkles size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c947d]">
              AI Action Proposal (Requires Confirmation)
            </span>
          </div>
          <h4 className="font-bold text-sm text-[#2e2f22] dark:text-[#faf8f3] mt-0.5">{proposal.title}</h4>
          <p className="text-xs text-[#8c947d] mt-1">{proposal.description}</p>
        </div>
      </div>

      {/* Proposed Time Blocks */}
      {proposal.blocks.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-[#8c947d] uppercase tracking-wider">
            Proposed Schedule Adjustments:
          </span>
          <div className="space-y-1.5">
            {proposal.blocks.map((block) => (
              <div
                key={block.taskId}
                className="p-2.5 rounded-xl bg-white dark:bg-[#2e2f22] border border-[#d6c7ad] flex items-center justify-between text-xs"
              >
                <span className="font-bold text-[#2e2f22] dark:text-[#faf8f3] truncate flex-1 pr-2">
                  {block.taskTitle}
                </span>
                <span className="text-[#2e2f22] font-bold flex items-center gap-1">
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
      <div className="flex justify-end gap-2 pt-2 border-t border-[#d6c7ad]">
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
