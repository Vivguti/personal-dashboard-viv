import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createWorkout } from '@/services/workoutService'

export interface WorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onWorkoutLogged?: () => void
}

export function WorkoutModal({ isOpen, onClose, onWorkoutLogged }: WorkoutModalProps) {
  const [title, setTitle] = useState('')
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio' | 'wrestling' | 'jiu_jitsu' | 'mobility' | 'recovery' | 'other'>('strength')
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(45)
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Workout title is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await createWorkout({
        title: title.trim(),
        workout_type: workoutType,
        duration_minutes: durationMinutes !== '' ? Number(durationMinutes) : null,
        intensity,
        completed: true,
        notes: notes.trim() || null,
        scheduled_time: new Date().toISOString(),
      })

      if (onWorkoutLogged) onWorkoutLogged()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log workout')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Workout Session">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Workout Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Upper Body Hypertrophy / BJJ Sparring"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workout Type *
            </label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardio / Zone 2</option>
              <option value="wrestling">Wrestling</option>
              <option value="jiu_jitsu">Jiu-Jitsu (BJJ)</option>
              <option value="mobility">Mobility / Stretching</option>
              <option value="recovery">Active Recovery</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Intensity
            </label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="low">Low Intensity</option>
              <option value="medium">Medium Intensity</option>
              <option value="high">High Intensity</option>
            </select>
          </div>
        </div>

        <Input
          label="Duration (minutes)"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
          min={1}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Session Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            placeholder="Sets, weights, techniques, or energy notes..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Log Workout
          </Button>
        </div>
      </form>
    </Modal>
  )
}
