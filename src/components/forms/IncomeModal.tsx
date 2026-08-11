import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { logIncome } from '@/services/financeService'

export interface IncomeModalProps {
  isOpen: boolean
  onClose: () => void
  onIncomeLogged?: () => void
}

export function IncomeModal({ isOpen, onClose, onIncomeLogged }: IncomeModalProps) {
  const [source, setSource] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [frequency, setFrequency] = useState<'one_time' | 'weekly' | 'biweekly' | 'monthly'>('one_time')
  const [category, setCategory] = useState<'job' | 'business' | 'freelance' | 'gift' | 'other'>('job')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!source.trim()) {
      setError('Income source is required.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await logIncome({
        source: source.trim(),
        amount: Number(amount),
        date,
        frequency,
        category,
        notes: notes.trim() || null,
      })

      if (onIncomeLogged) onIncomeLogged()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log income')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Income">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Income Source *"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g. Primary Job Paycheck / Client Retainer"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount ($) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
            placeholder="1200.00"
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="job">Primary Job</option>
              <option value="business">Business</option>
              <option value="freelance">Freelance / Contract</option>
              <option value="gift">Gift / Bonus</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="one_time">One-Time</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
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
            placeholder="Deposit details or invoice reference..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Log Income
          </Button>
        </div>
      </form>
    </Modal>
  )
}
