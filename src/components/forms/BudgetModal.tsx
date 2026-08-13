import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createBudget } from '@/services/financeService'

export interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onBudgetSaved?: () => void
}

export function BudgetModal({ isOpen, onClose, onBudgetSaved }: BudgetModalProps) {
  const [category, setCategory] = useState('food')
  const [monthlyAmount, setMonthlyAmount] = useState<number | ''>('')
  const [warningThreshold, setWarningThreshold] = useState<number>(80)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monthlyAmount || Number(monthlyAmount) <= 0) {
      setError('Please enter a valid monthly budget amount.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const now = new Date()
      const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

      await createBudget({
        category,
        monthly_amount: Number(monthlyAmount),
        start_date: startDate,
        warning_threshold: warningThreshold,
      })

      if (onBudgetSaved) onBudgetSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save budget')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Category Budget">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#26352E] mb-1">
            Budget Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm font-semibold text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
          >
            <option value="housing">Housing & Rent</option>
            <option value="food">Food & Groceries</option>
            <option value="transportation">Transportation & Gas</option>
            <option value="school">School & Tuition</option>
            <option value="business">Business Expense</option>
            <option value="health">Health & Medical</option>
            <option value="fitness">Fitness & Gym</option>
            <option value="entertainment">Entertainment</option>
            <option value="shopping">Shopping</option>
            <option value="subscriptions">Subscriptions & Bills</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monthly Limit ($) *"
            type="number"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value ? Number(e.target.value) : '')}
            placeholder="500.00"
            required
            min={1}
          />

          <Input
            label="Warning Alert Threshold (%)"
            type="number"
            value={warningThreshold}
            onChange={(e) => setWarningThreshold(Number(e.target.value))}
            placeholder="80"
            min={10}
            max={100}
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Budget
          </Button>
        </div>
      </form>
    </Modal>
  )
}
