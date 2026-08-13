import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { logMeal } from '@/services/nutritionService'

export interface MealModalProps {
  isOpen: boolean
  onClose: () => void
  onMealLogged?: () => void
}

export function MealModal({ isOpen, onClose, onMealLogged }: MealModalProps) {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'>('breakfast')
  const [name, setName] = useState('')
  const [calories, setCalories] = useState<number | ''>('')
  const [protein, setProtein] = useState<number | ''>('')
  const [carbs, setCarbs] = useState<number | ''>('')
  const [fat, setFat] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Meal name is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await logMeal({
        meal_type: mealType,
        name: name.trim(),
        calories: calories !== '' ? Number(calories) : null,
        protein: protein !== '' ? Number(protein) : null,
        carbohydrates: carbs !== '' ? Number(carbs) : null,
        fat: fat !== '' ? Number(fat) : null,
        notes: notes.trim() || null,
        timestamp: new Date().toISOString(),
      })

      if (onMealLogged) onMealLogged()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log meal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Meal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#26352E] mb-1">
            Meal Category *
          </label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as any)}
            className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm font-semibold text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Input
          label="Meal Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Grilled Chicken Salad & Rice"
          required
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : '')}
            placeholder="650"
          />
          <Input
            label="Protein (g)"
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value ? Number(e.target.value) : '')}
            placeholder="45"
          />
          <Input
            label="Carbs (g)"
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value ? Number(e.target.value) : '')}
            placeholder="60"
          />
          <Input
            label="Fat (g)"
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value ? Number(e.target.value) : '')}
            placeholder="15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#26352E] mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            placeholder="Portion details or notes..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Log Meal
          </Button>
        </div>
      </form>
    </Modal>
  )
}
