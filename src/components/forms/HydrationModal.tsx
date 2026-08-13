import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HYDRATION_PRESETS } from '@/lib/constants'
import { logHydration } from '@/services/hydrationService'
import { Droplets } from 'lucide-react'

export interface HydrationModalProps {
  isOpen: boolean
  onClose: () => void
  onHydrationLogged?: () => void
}

export function HydrationModal({ isOpen, onClose, onHydrationLogged }: HydrationModalProps) {
  const [customAmount, setCustomAmount] = useState<number | ''>('')
  const [unit, setUnit] = useState<'oz' | 'ml'>('oz')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleQuickLog = async (presetAmount: number) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await logHydration(presetAmount, unit, 'quick_add')
      if (onHydrationLogged) onHydrationLogged()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log water intake')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customAmount || Number(customAmount) <= 0) {
      setError('Please enter a valid water amount.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await logHydration(Number(customAmount), unit, 'manual', notes.trim() || undefined)
      if (onHydrationLogged) onHydrationLogged()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log water intake')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Hydration">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Preset Quick Action Buttons */}
        <div>
          <label className="block text-xs font-semibold text-[#718078] uppercase tracking-wider mb-2">
            Quick Add Presets
          </label>
          <div className="grid grid-cols-4 gap-2">
            {HYDRATION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLog(preset.amount)}
                className="p-3 rounded-xl border border-[#E8F0EA] bg-[#F3F7F3] text-[#315C4A] hover:bg-[#E8F0EA] hover:border-[#A8BDAF] transition-all font-bold text-sm flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <Droplets size={18} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative border-t border-[#E8F0EA] pt-4">
          <label className="block text-xs font-semibold text-[#718078] uppercase tracking-wider mb-2">
            Custom Entry
          </label>
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value ? Number(e.target.value) : '')}
                  min={1}
                />
              </div>

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'oz' | 'ml')}
                className="rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm font-semibold text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
              >
                <option value="oz">oz</option>
                <option value="ml">ml</option>
              </select>
            </div>

            <Input
              placeholder="Notes (optional, e.g. With electrolyte mix)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Log Custom Amount
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
