import { useState, useEffect } from 'react'
import type { CalendarEvent } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createCalendarEvent, updateCalendarEvent } from '@/services/calendarService'
import { getLifeAreas, type LifeAreaRow } from '@/services/lifeAreasService'

export interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  eventToEdit?: CalendarEvent | null
  onEventSaved?: (savedEvent: CalendarEvent) => void
}

export function EventModal({ isOpen, onClose, eventToEdit, onEventSaved }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [eventType, setEventType] = useState<CalendarEvent['event_type']>('personal')
  const [lifeAreaId, setLifeAreaId] = useState('')
  const [isFixed, setIsFixed] = useState(true) // Default to Fixed commitment

  const [lifeAreas, setLifeAreas] = useState<LifeAreaRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      getLifeAreas().then(setLifeAreas)

      const defaultStart = new Date()
      defaultStart.setMinutes(0, 0, 0)
      const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000)

      if (eventToEdit) {
        setTitle(eventToEdit.title)
        setDescription(eventToEdit.description ?? '')
        setStartTime(eventToEdit.start_time ? eventToEdit.start_time.slice(0, 16) : '')
        setEndTime(eventToEdit.end_time ? eventToEdit.end_time.slice(0, 16) : '')
        setLocation(eventToEdit.location ?? '')
        setEventType(eventToEdit.event_type)
        setLifeAreaId(eventToEdit.life_area_id ?? '')
        setIsFixed(eventToEdit.is_fixed)
      } else {
        setTitle('')
        setDescription('')
        setStartTime(defaultStart.toISOString().slice(0, 16))
        setEndTime(defaultEnd.toISOString().slice(0, 16))
        setLocation('')
        setEventType('personal')
        setLifeAreaId('')
        setIsFixed(true)
      }
      setError(null)
    }
  }, [isOpen, eventToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Event title is required.')
      return
    }
    if (!startTime || !endTime) {
      setError('Start time and end time are required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        location: location.trim() || null,
        event_type: eventType,
        life_area_id: lifeAreaId || null,
        is_fixed: isFixed,
        source: 'manual' as const,
      }

      let saved: CalendarEvent | null = null
      if (eventToEdit) {
        saved = await updateCalendarEvent(eventToEdit.id, payload)
      } else {
        saved = await createCalendarEvent(payload)
      }

      if (saved && onEventSaved) {
        onEventSaved(saved)
      }
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save calendar event')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={eventToEdit ? 'Edit Event' : 'New Calendar Event'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Event Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Physics 101 Lecture"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Time *"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="End Time *"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {/* Fixed vs Flexible Toggle */}
        <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Commitment Type
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isFixed ? 'Fixed (Classes, Meetings, Appointments — AI will never reschedule)' : 'Flexible (Study, Personal, Admin tasks)'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFixed(!isFixed)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              isFixed ? 'bg-emerald-700' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isFixed ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Category
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as CalendarEvent['event_type'])}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="class">Class</option>
              <option value="meeting">Meeting</option>
              <option value="appointment">Appointment</option>
              <option value="deadline">Deadline</option>
              <option value="training">Training</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Life Area
            </label>
            <select
              value={lifeAreaId}
              onChange={(e) => setLifeAreaId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="">None</option>
              {lifeAreas.map((la) => (
                <option key={la.id} value={la.id}>{la.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Science Building Rm 302 / Zoom link"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description / Agenda
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            placeholder="Event details..."
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {eventToEdit ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
