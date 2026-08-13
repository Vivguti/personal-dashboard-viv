import { useState, useEffect } from 'react'
import type { CalendarEvent } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { createCalendarEvent, updateCalendarEvent } from '@/services/calendarService'
import { getLifeAreas, type LifeAreaRow } from '@/services/lifeAreasService'

export interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  eventToEdit?: CalendarEvent | null
  onEventSaved?: (savedEvent: CalendarEvent) => void
}

const field = 'w-full px-3 py-2 text-sm rounded-xl border border-[#E8F0EA] bg-white text-[#26352E] placeholder-[#718078]/50 focus:outline-none focus:ring-2 focus:ring-[#315C4A] focus:border-[#315C4A] transition-all'
const label = 'block text-xs font-bold text-[#718078] uppercase tracking-wider mb-1'

export function EventModal({ isOpen, onClose, eventToEdit, onEventSaved }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [eventType, setEventType] = useState<CalendarEvent['event_type']>('personal')
  const [lifeAreaId, setLifeAreaId] = useState('')
  const [isFixed, setIsFixed] = useState(true)
  const [lifeAreas, setLifeAreas] = useState<LifeAreaRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      getLifeAreas().then(setLifeAreas)
      const defaultStart = new Date(); defaultStart.setMinutes(0, 0, 0)
      const defaultEnd   = new Date(defaultStart.getTime() + 60 * 60 * 1000)

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
        setTitle(''); setDescription('')
        setStartTime(defaultStart.toISOString().slice(0, 16))
        setEndTime(defaultEnd.toISOString().slice(0, 16))
        setLocation(''); setEventType('personal'); setLifeAreaId(''); setIsFixed(true)
      }
      setError(null)
    }
  }, [isOpen, eventToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Event title is required.'); return }
    if (!startTime || !endTime) { setError('Start time and end time are required.'); return }
    try {
      setIsSubmitting(true); setError(null)
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
      const saved = eventToEdit
        ? await updateCalendarEvent(eventToEdit.id, payload)
        : await createCalendarEvent(payload)
      if (saved && onEventSaved) onEventSaved(saved)
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
          <div className="p-3 bg-[#26352E]/10 border border-[#26352E]/20 text-[#26352E] rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className={label}>Event Title *</label>
          <input className={field} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Studio Critique" required />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Start Time *</label>
            <input type="datetime-local" className={field} value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label className={label}>End Time *</label>
            <input type="datetime-local" className={field} value={endTime} onChange={e => setEndTime(e.target.value)} required />
          </div>
        </div>

        {/* Fixed / Flexible toggle */}
        <div className="p-4 rounded-xl border border-[#E8F0EA] bg-[#F3F7F3] flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-[#26352E]">Commitment Type</div>
            <div className="text-xs text-[#718078] mt-0.5">
              {isFixed ? 'Fixed — AI will never reschedule (classes, meetings)' : 'Flexible — can be moved around (study, tasks)'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFixed(!isFixed)}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isFixed ? 'bg-[#315C4A]' : 'bg-[#E8F0EA]'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isFixed ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Category & Life Area */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Event Category</label>
            <select className={field} value={eventType} onChange={e => setEventType(e.target.value as CalendarEvent['event_type'])}>
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
            <label className={label}>Life Area</label>
            <select className={field} value={lifeAreaId} onChange={e => setLifeAreaId(e.target.value)}>
              <option value="">None</option>
              {lifeAreas.map(la => <option key={la.id} value={la.id}>{la.name}</option>)}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className={label}>Location</label>
          <input className={field} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Studio 204 / Zoom link" />
        </div>

        {/* Description */}
        <div>
          <label className={label}>Description / Notes</label>
          <textarea
            className={`${field} resize-none`}
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Event details..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none font-bold"
          >
            {eventToEdit ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
