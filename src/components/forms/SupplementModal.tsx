import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createSupplement } from '@/services/supplementService'
import { AlertCircle } from 'lucide-react'

export interface SupplementModalProps {
  isOpen: boolean
  onClose: () => void
  onSupplementSaved?: () => void
}

export function SupplementModal({ isOpen, onClose, onSupplementSaved }: SupplementModalProps) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [servingSize, setServingSize] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [unit, setUnit] = useState('mg')
  const [frequency, setFrequency] = useState<'daily' | 'twice_daily' | 'weekly' | 'as_needed' | 'other'>('daily')
  const [withFood, setWithFood] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Supplement name is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await createSupplement({
        name: name.trim(),
        brand: brand.trim() || null,
        serving_size: servingSize.trim() || null,
        amount: amount !== '' ? Number(amount) : null,
        unit: unit.trim() || null,
        frequency,
        with_food: withFood,
        active: true,
        notes: notes.trim() || null,
      })

      if (onSupplementSaved) onSupplementSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save supplement')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Supplement Tracker">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Safety Disclaimer */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Safety Disclaimer:</strong> Personal OS is a personal logging and reminder tool, not a medical provider. Always consult a qualified healthcare professional regarding dietary supplements or medical decisions.
          </span>
        </div>

        <Input
          label="Supplement Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Creatine Monohydrate / Vitamin D3"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Thorne, Optimum Nutrition"
          />
          <Input
            label="Serving Size"
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            placeholder="e.g. 1 scoop / 2 capsules"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
            placeholder="5"
          />
          <Input
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="mg, g, IU"
          />
          <div>
            <label className="block text-sm font-medium text-[#26352E] mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm font-semibold text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="weekly">Weekly</option>
              <option value="as_needed">As Needed</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="withFood"
            checked={withFood}
            onChange={(e) => setWithFood(e.target.checked)}
            className="rounded border-[#E8F0EA] text-emerald-700 focus:ring-[#315C4A]"
          />
          <label htmlFor="withFood" className="text-sm font-medium text-[#26352E]">
            Take with food
          </label>
        </div>

        <Input
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Take with morning meal"
        />

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Supplement
          </Button>
        </div>
      </form>
    </Modal>
  )
}
