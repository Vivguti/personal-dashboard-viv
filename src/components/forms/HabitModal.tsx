import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createHabit } from '@/services/habitService'

export interface HabitModalProps {
  isOpen: boolean
  onClose: () => void
  onHabitSaved?: () => void
}

export function HabitModal({ isOpen, onClose, onHabitSaved }: HabitModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Health')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Habit title is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await createHabit({
        title: title.trim(),
        category: category.trim() || null,
        frequency,
        target: 1,
        active: true,
      })

      if (onHabitSaved) onHabitSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save habit')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Habit">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Habit Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Read 20 pages / Morning Sunlight"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Health, Focus, Mindset"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Habit
          </Button>
        </div>
      </form>
    </Modal>
  )
}
