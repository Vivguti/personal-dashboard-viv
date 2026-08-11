import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { logExpense } from '@/services/financeService'

export interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onExpenseLogged?: () => void
}

export function ExpenseModal({ isOpen, onClose, onExpenseLogged }: ExpenseModalProps) {
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState<
    'housing' | 'food' | 'transportation' | 'school' | 'business' | 'health' | 'fitness' | 'entertainment' | 'shopping' | 'subscriptions' | 'personal' | 'other'
  >('food')
  const [recurring, setRecurring] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant.trim()) {
      setError('Merchant / recipient name is required.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await logExpense({
        merchant: merchant.trim(),
        amount: Number(amount),
        date,
        category,
        recurring,
        notes: notes.trim() || null,
      })

      if (onExpenseLogged) onExpenseLogged()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Merchant / Recipient *"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="e.g. Trader Joe's / Chipotle / Rent"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount ($) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
            placeholder="45.50"
            required
            min={0.01}
            step="0.01"
          />

          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expense Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="recurring"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
          />
          <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recurring monthly bill
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            placeholder="Item details..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Log Expense
          </Button>
        </div>
      </form>
    </Modal>
  )
}
