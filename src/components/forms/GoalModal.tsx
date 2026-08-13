import { useState, useEffect } from 'react'
import type { Goal, Priority } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createGoal, updateGoal } from '@/services/goalsService'
import { getLifeAreas, type LifeAreaRow } from '@/services/lifeAreasService'

export interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goalToEdit?: Goal | null
  onGoalSaved?: (savedGoal: Goal) => void
}

export function GoalModal({ isOpen, onClose, goalToEdit, onGoalSaved }: GoalModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [lifeAreaId, setLifeAreaId] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [targetValue, setTargetValue] = useState<number | ''>('')
  const [currentValue, setCurrentValue] = useState<number>(0)
  const [unit, setUnit] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const [lifeAreas, setLifeAreas] = useState<LifeAreaRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      getLifeAreas().then(setLifeAreas)

      if (goalToEdit) {
        setTitle(goalToEdit.title)
        setDescription(goalToEdit.description ?? '')
        setCategory(goalToEdit.category ?? '')
        setLifeAreaId(goalToEdit.life_area_id ?? '')
        setPriority(goalToEdit.priority)
        setTargetValue(goalToEdit.target_value ?? '')
        setCurrentValue(goalToEdit.current_value ?? 0)
        setUnit(goalToEdit.unit ?? '')
        setTargetDate(goalToEdit.target_date ?? '')
      } else {
        setTitle('')
        setDescription('')
        setCategory('')
        setLifeAreaId('')
        setPriority('medium')
        setTargetValue('')
        setCurrentValue(0)
        setUnit('')
        setTargetDate('')
      }
      setError(null)
    }
  }, [isOpen, goalToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Goal title is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        life_area_id: lifeAreaId || null,
        priority,
        target_value: targetValue !== '' ? Number(targetValue) : null,
        current_value: Number(currentValue),
        unit: unit.trim() || null,
        target_date: targetDate || null,
      }

      let saved: Goal | null = null
      if (goalToEdit) {
        saved = await updateGoal(goalToEdit.id, payload)
      } else {
        saved = await createGoal(payload)
      }

      if (saved && onGoalSaved) {
        onGoalSaved(saved)
      }
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save goal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? 'Edit Goal' : 'New Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Input
          label="Goal Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Save $5,000 Emergency Fund"
          required
        />

        <div>
          <label className="block text-sm font-medium text-[#26352E] mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            placeholder="Why is this goal important?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#26352E] mb-1">
              Life Area
            </label>
            <select
              value={lifeAreaId}
              onChange={(e) => setLifeAreaId(e.target.value)}
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="">None</option>
              {lifeAreas.map((la) => (
                <option key={la.id} value={la.id}>{la.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#26352E] mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Target Value"
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value ? Number(e.target.value) : '')}
            placeholder="5000"
          />
          <Input
            label="Current Value"
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(Number(e.target.value))}
            placeholder="0"
          />
          <Input
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="USD, lbs, hrs"
          />
        </div>

        <Input
          label="Target Date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {goalToEdit ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
