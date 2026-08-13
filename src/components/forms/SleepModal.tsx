import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { logSleep } from '@/services/sleepService'
import { Star } from 'lucide-react'

export interface SleepModalProps {
  isOpen: boolean
  onClose: () => void
  onSleepLogged?: () => void
}

export function SleepModal({ isOpen, onClose, onSleepLogged }: SleepModalProps) {
  const defaultEnd = new Date().toISOString().slice(0, 16)
  const defaultStart = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString().slice(0, 16)

  const [sleepStart, setSleepStart] = useState(defaultStart)
  const [sleepEnd, setSleepEnd] = useState(defaultEnd)
  const [quality, setQuality] = useState(4)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sleepStart || !sleepEnd) {
      setError('Sleep start and wake time are required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await logSleep(sleepStart, sleepEnd, quality, notes.trim() || undefined)
      if (onSleepLogged) onSleepLogged()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log sleep')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Sleep & Recovery">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Bedtime *"
            type="datetime-local"
            value={sleepStart}
            onChange={(e) => setSleepStart(e.target.value)}
            required
          />
          <Input
            label="Wake Time *"
            type="datetime-local"
            value={sleepEnd}
            onChange={(e) => setSleepEnd(e.target.value)}
            required
          />
        </div>

        {/* Quality Score 1-5 Stars */}
        <div>
          <label className="block text-sm font-medium text-[#26352E] mb-2">
            Sleep Quality Rating ({quality} / 5 Stars)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setQuality(star)}
                className={`p-3 rounded-xl border flex-1 flex items-center justify-center transition-all ${
                  quality >= star
                    ? 'bg-[#E8F0EA] border-[#A8BDAF] text-[#315C4A]'
                    : 'border-[#E8F0EA] text-[#718078]'
                }`}
              >
                <Star size={20} className={quality >= star ? 'fill-[#315C4A]' : ''} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#26352E] mb-1">
            Recovery Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            placeholder="Felt rested, night awakenings, dreams..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Log Sleep
          </Button>
        </div>
      </form>
    </Modal>
  )
}
