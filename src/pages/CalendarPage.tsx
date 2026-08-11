import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, Plus, MapPin, Clock, Lock } from 'lucide-react'
import type { CalendarEvent } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EventModal } from '@/components/forms/EventModal'
import { getCalendarEvents } from '@/services/calendarService'

export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedEvents = await getCalendarEvents()
      setEvents(fetchedEvents)
    } catch (err) {
      console.error('Failed to load calendar events:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateNew = () => {
    setEventToEdit(null)
    setIsModalOpen(true)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {events.length} scheduled events · Fixed commitments protected
          </p>
        </div>

        <Button onClick={handleCreateNew} icon={<Plus size={18} />}>
          New Event
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading schedule...</div>
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((evt) => (
            <Card
              key={evt.id}
              className={`p-4 transition-all ${
                evt.is_fixed
                  ? 'border-l-4 border-l-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-l-emerald-500'
                  : 'border-l-4 border-l-blue-500 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {evt.title}
                    </h3>
                    {evt.is_fixed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                        <Lock size={10} /> Fixed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                        Flexible
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-emerald-700 dark:text-emerald-400" />
                      {formatDate(evt.start_time)} · {formatTime(evt.start_time)} - {formatTime(evt.end_time)}
                    </span>

                    {evt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {evt.location}
                      </span>
                    )}
                  </div>

                  {evt.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {evt.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center mb-4">
            <CalendarDays size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            No events scheduled
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            Add fixed commitments (classes, meetings) or flexible study sessions to your calendar.
          </p>
          <Button onClick={handleCreateNew} icon={<Plus size={18} />}>
            New Event
          </Button>
        </div>
      )}

      {/* Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventToEdit={eventToEdit}
        onEventSaved={loadData}
      />
    </div>
  )
}
