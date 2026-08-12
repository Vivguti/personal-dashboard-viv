import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus, CalendarDays, Clock, Zap, Play, Trash, ChevronLeft, ChevronRight,
  CheckCircle2, Moon, Sparkles, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EventModal } from '@/components/forms/EventModal'
import { TaskModal } from '@/components/forms/TaskModal'
import { Modal } from '@/components/ui/Modal'
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent
} from '@/services/calendarService'
import {
  getTasks,
  createTask,
  toggleTaskComplete,
  deleteTask,
  updateTaskSchedule
} from '@/services/tasksService'
import type { CalendarEvent, Task } from '@/types'

// ─── Premium Sage & White Palette Colors ─────────────────────────────────────
// Deep Botanical Green   : #315C4A
// Sage                   : #A8BDAF
// Light Sage             : #E8F0EA
// Very Light Sage        : #F3F7F3
// Warm Ivory             : #FBFAF6
// White                  : #FFFFFF
// Dark Green-Charcoal    : #26352E
// Muted Green-Gray       : #718078
// Terracotta Accent      : #a85d48
// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = 'today' | 'week' | 'month' | 'agenda'

interface TimelineItem {
  id: string
  title: string
  description: string | null
  start: Date
  end: Date
  isFixed: boolean
  type: string
  location: string | null
  rawEvent?: CalendarEvent
  rawTask?: Task
  itemType: 'event' | 'task'
}

// ─── Unified Calendar Color Coding Categories ──────────────────────────────
export type CalendarCategory = 'school' | 'work' | 'extra' | 'assignment_test' | 'other'

export const getItemCategory = (item: TimelineItem): CalendarCategory => {
  const titleLower = item.title.toLowerCase()

  // 1. Assignments and Tests (distinct terracotta tone)
  if (
    titleLower.includes('assignment') ||
    titleLower.includes('test') ||
    titleLower.includes('exam') ||
    titleLower.includes('quiz') ||
    titleLower.includes('project') ||
    titleLower.includes('study') ||
    titleLower.includes('homework') ||
    item.rawEvent?.event_type === 'deadline' ||
    (item.itemType === 'task' && item.rawTask?.priority === 'critical')
  ) {
    return 'assignment_test'
  }

  // 2. School / Architecture Classes
  if (
    item.type === 'class' ||
    item.rawEvent?.life_area_id === 'school' ||
    item.rawTask?.life_area_id === 'school'
  ) {
    return 'school'
  }

  // 3. Work Shifts / Employment responsibilities
  if (
    item.type === 'business' ||
    titleLower.includes('work') ||
    titleLower.includes('shift') ||
    titleLower.includes('tech shop') ||
    titleLower.includes('job') ||
    item.rawEvent?.life_area_id === 'work' ||
    item.rawTask?.life_area_id === 'work'
  ) {
    return 'work'
  }

  // 4. Extra Activities / Training / Personal commitments / Wellness
  if (
    item.type === 'training' ||
    item.type === 'personal' ||
    titleLower.includes('gym') ||
    titleLower.includes('training') ||
    titleLower.includes('workout') ||
    titleLower.includes('meal') ||
    titleLower.includes('water') ||
    titleLower.includes('habit') ||
    item.rawEvent?.life_area_id === 'health' ||
    item.rawTask?.life_area_id === 'health' ||
    item.rawEvent?.life_area_id === 'personal' ||
    item.rawTask?.life_area_id === 'personal'
  ) {
    return 'extra'
  }

  return 'other'
}

export const getItemStyles = (item: TimelineItem): string => {
  if (item.itemType === 'task' && item.rawTask?.status === 'completed') {
    return 'bg-[#F3F7F3] text-[#718078] border-[#E8F0EA] line-through'
  }

  const category = getItemCategory(item)
  switch (category) {
    case 'assignment_test':
      return 'bg-[#a85d48] text-white border-[#8c4837]'
    case 'school':
      return 'bg-[#315C4A] text-white border-[#26352E]'
    case 'work':
      return 'bg-[#5e6544] text-[#FBFAF6] border-[#2e2f22]'
    case 'extra':
      return 'bg-[#E8F0EA] text-[#315C4A] border-[#A8BDAF]'
    default:
      return 'bg-[#FBFAF6] text-[#26352E] border-[#315C4A]/50 border-l-4 border-l-[#315C4A]'
  }
}

export const getDotColor = (item: TimelineItem): string => {
  if (item.itemType === 'task' && item.rawTask?.status === 'completed') {
    return 'bg-[#718078]'
  }
  const category = getItemCategory(item)
  switch (category) {
    case 'assignment_test': return 'bg-[#a85d48]'
    case 'school': return 'bg-[#315C4A]'
    case 'work': return 'bg-[#5e6544]'
    case 'extra': return 'bg-[#A8BDAF]'
    default: return 'bg-[#718078]'
  }
}

export function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Core Data
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  // Modals & State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)

  // Viv's Setup State (with persistence)
  const [isStructuresConfirmed, setIsStructuresConfirmed] = useState<boolean>(() => {
    return localStorage.getItem('pos_structures_confirmed') === 'true'
  })
  const [structuresTime, setStructuresTime] = useState<string>(() => {
    return localStorage.getItem('pos_structures_time') || '14:00'
  })
  const [secondJobStartDateConfirmed, setSecondJobStartDateConfirmed] = useState<string | null>(() => {
    return localStorage.getItem('pos_second_job_confirmed_start')
  })
  const [isConflictDismissed, setIsConflictDismissed] = useState<boolean>(() => {
    return localStorage.getItem('pos_conflict_dismissed') === 'true'
  })

  // Focus Mode Overlay
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null)
  const [focusTimeRemaining, setFocusTimeRemaining] = useState<number>(0)
  const [isFocusPaused, setIsFocusPaused] = useState(false)
  const focusTimerRef = useRef<any>(null)

  // AI Day Builder & Brain Dump proposed plan state
  const [proposedPlan, setProposedPlan] = useState<any[] | null>(null)
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false)
  const [brainDumpText, setBrainDumpText] = useState('')
  const [nlpInput, setNlpInput] = useState('')
  const [nlpParsedPreview, setNlpParsedPreview] = useState<any | null>(null)

  // AI Calendar Assistant state
  const [aiAssistantQuery, setAiAssistantQuery] = useState('')
  const [aiAssistantResponse, setAiAssistantResponse] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Drag & drop
  const timelineRef = useRef<HTMLDivElement>(null)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  // Centering NOW line
  const nowIndicatorRef = useRef<HTMLDivElement>(null)

  // Refresh clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000 * 60)
    return () => clearInterval(timer)
  }, [])

  // Focus mode timer
  useEffect(() => {
    if (activeFocusTask && !isFocusPaused && focusTimeRemaining > 0) {
      focusTimerRef.current = setTimeout(() => {
        setFocusTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (focusTimeRemaining === 0 && activeFocusTask) {
      handleCompleteFocusTask()
    }
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    }
  }, [activeFocusTask, focusTimeRemaining, isFocusPaused])

  // Center NOW line on load/date change
  useEffect(() => {
    if (viewMode === 'today' && nowIndicatorRef.current) {
      setTimeout(() => {
        nowIndicatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [viewMode, selectedDate])

  const loadData = useCallback(async () => {
    try {
      const fetchedEvents = await getCalendarEvents()
      const fetchedTasks = await getTasks()
      setEvents(fetchedEvents)
      setTasks(fetchedTasks)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Parse Date string logic
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // Get active day timeline items
  const getTimelineItems = (date: Date): TimelineItem[] => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), date))
    const dayTasks = tasks.filter(t => t.scheduled_start && isSameDay(new Date(t.scheduled_start), date))

    const items: TimelineItem[] = [
      ...dayEvents.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        isFixed: e.is_fixed,
        type: e.event_type,
        location: e.location,
        rawEvent: e,
        itemType: 'event' as const
      })),
      ...dayTasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        start: new Date(t.scheduled_start!),
        end: new Date(t.scheduled_end!),
        isFixed: false,
        type: 'focus' as const,
        location: null,
        rawTask: t,
        itemType: 'task' as const
      }))
    ]

    // Dynamically inject Second Job shifts if confirmed
    if (secondJobStartDateConfirmed) {
      const startSem = new Date(secondJobStartDateConfirmed)
      const endSem = new Date('2026-12-15')
      let currentJob = new Date(startSem)
      while (currentJob <= endSem) {
        if ((currentJob.getDay() === 1 || currentJob.getDay() === 3) && isSameDay(currentJob, date)) {
          const s = new Date(currentJob)
          s.setHours(12, 0, 0, 0)
          const e = new Date(currentJob)
          e.setHours(15, 0, 0, 0)
          items.push({
            id: `viv-secondjob-shift-${currentJob.toISOString().slice(0, 10)}`,
            title: 'Second Job Shift',
            description: 'Second Job hourly shift. $18.00/hour. Fixed.',
            start: s,
            end: e,
            isFixed: true,
            type: 'business',
            location: 'Office',
            itemType: 'event' as const
          })
        }
        currentJob.setDate(currentJob.getDate() + 1)
      }
    }

    // Dynamically inject Architectural Structures shifts if confirmed
    if (isStructuresConfirmed) {
      const startSem = new Date('2026-08-24')
      const endSem = new Date('2026-12-15')
      let currentClass = new Date(startSem)
      const sParts = structuresTime.split(':').map(Number)
      const sH = sParts[0] ?? 14
      const sM = sParts[1] ?? 0
      while (currentClass <= endSem) {
        if ((currentClass.getDay() === 2 || currentClass.getDay() === 4) && isSameDay(currentClass, date)) {
          const s = new Date(currentClass)
          s.setHours(sH, sM, 0, 0)
          const e = new Date(currentClass)
          e.setHours(sH, sM + 60, 0, 0) // default 1 hour class duration
          items.push({
            id: `viv-structures-class-${currentClass.toISOString().slice(0, 10)}`,
            title: 'ARCH-331 Architectural Structures',
            description: 'ARCC-105. Fixed.',
            start: s,
            end: e,
            isFixed: true,
            type: 'class',
            location: 'ARCC-105',
            itemType: 'event' as const
          })
        }
        currentClass.setDate(currentClass.getDate() + 1)
      }
    }

    return items.sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  // Calculate Capacity details
  const getCapacityDetails = (date: Date) => {
    const items = getTimelineItems(date)
    let totalPlannedMinutes = 0
    items.forEach(item => {
      const diff = (item.end.getTime() - item.start.getTime()) / (1000 * 60)
      totalPlannedMinutes += diff
    })

    const totalAvailableMinutes = 480 // 8 hours focus capacity standard
    const pct = Math.min(100, Math.round((totalPlannedMinutes / totalAvailableMinutes) * 100))

    let status = 'Open'
    if (pct > 95) status = 'Over Capacity'
    else if (pct > 80) status = 'Busy'
    else if (pct > 60) status = 'Balanced'

    return {
      percentage: pct,
      plannedMinutes: totalPlannedMinutes,
      availableMinutes: Math.max(0, totalAvailableMinutes - totalPlannedMinutes),
      status
    }
  }

  // Smart Rescheduling logic (detect missed tasks)
  const getMissedTasks = () => {
    const today = new Date()
    return tasks.filter(t => {
      if (t.status === 'completed' || !t.scheduled_start) return false
      const end = new Date(t.scheduled_end!)
      return end.getTime() < today.getTime()
    })
  }

  const handleAutoReschedule = async (task: Task) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    const duration = task.estimated_minutes ?? 45
    const end = new Date(tomorrow.getTime() + duration * 60 * 1000)
    await updateTaskSchedule(task.id, tomorrow.toISOString(), end.toISOString())
    loadData()
  }

  // Conflict Detection
  const getConflicts = (date: Date) => {
    const items = getTimelineItems(date)
    const conflicts: string[] = []

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]
        const b = items[j]
        if (a && b && a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime()) {
          conflicts.push(`"${a.title}" overlaps with "${b.title}"`)
        }
      }
    }
    return conflicts
  }

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedTaskId || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const offsetY = e.clientY - rect.top + timelineRef.current.scrollTop
    // Each hour row is 72px. Total 16 hours (7 AM to 10 PM)
    const totalMinutes = (offsetY / 72) * 60
    const startHour = 7 + Math.floor(totalMinutes / 60)
    const startMin = Math.round((totalMinutes % 60) / 15) * 15

    const task = tasks.find(t => t.id === draggedTaskId)
    if (!task) return

    const schedStart = new Date(selectedDate)
    schedStart.setHours(startHour, startMin, 0, 0)

    const duration = task.estimated_minutes ?? 60
    const schedEnd = new Date(schedStart.getTime() + duration * 60 * 1000)

    await updateTaskSchedule(draggedTaskId, schedStart.toISOString(), schedEnd.toISOString())
    setDraggedTaskId(null)
    loadData()
  }

  // Mobile smart fits
  const getBestFitSlots = () => {
    return [
      { label: 'Today at 3:00 PM', start: new Date(new Date().setHours(15, 0, 0, 0)) },
      { label: 'Tomorrow at 10:00 AM', start: new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)) },
      { label: 'Thursday at 2:00 PM', start: new Date(new Date(Date.now() + 86400000 * 2).setHours(14, 0, 0, 0)) }
    ]
  }

  const handleApplyMobileFit = async (taskId: string, startDate: Date, duration: number) => {
    const end = new Date(startDate.getTime() + duration * 60 * 1000)
    await updateTaskSchedule(taskId, startDate.toISOString(), end.toISOString())
    loadData()
  }

  // Focus Mode handlers
  const handleStartFocus = (task: Task) => {
    setActiveFocusTask(task)
    setFocusTimeRemaining((task.estimated_minutes ?? 25) * 60)
    setIsFocusPaused(false)
  }

  const handleCompleteFocusTask = async () => {
    if (activeFocusTask) {
      await toggleTaskComplete(activeFocusTask.id, true)
      setActiveFocusTask(null)
      loadData()
    }
  }

  // NLP Input Parser preview
  const handleNlpChange = (text: string) => {
    setNlpInput(text)
    if (!text.trim()) {
      setNlpParsedPreview(null)
      return
    }

    const lower = text.toLowerCase()
    let parsed: any = { title: text, type: 'task', duration: 60, day: 'Today' }

    if (lower.includes('study')) parsed.title = 'Study Physics'
    if (lower.includes('meeting')) parsed.title = 'Client Design Meeting'

    if (lower.includes('tomorrow')) {
      parsed.day = 'Tomorrow'
    } else if (lower.includes('friday')) {
      parsed.day = 'Friday'
    }

    if (lower.includes('at 4')) parsed.time = '4:00 PM'
    if (lower.includes('at 10')) parsed.time = '10:00 AM'
    if (lower.includes('hour')) parsed.duration = 60
    if (lower.includes('30 min')) parsed.duration = 30

    setNlpParsedPreview(parsed)
  }

  const handleAddNlpItem = async () => {
    if (!nlpParsedPreview) return

    const baseDate = new Date()
    if (nlpParsedPreview.day === 'Tomorrow') baseDate.setDate(baseDate.getDate() + 1)
    if (nlpParsedPreview.day === 'Friday') {
      const dayDiff = (5 - baseDate.getDay() + 7) % 7
      baseDate.setDate(baseDate.getDate() + (dayDiff === 0 ? 7 : dayDiff))
    }

    const [hoursStr, minsStr] = (nlpParsedPreview.time ?? '9:00 AM').split(':')
    let hours = parseInt(hoursStr)
    const minsStrClean = minsStr ? minsStr.replace(/[^0-9]/g, '') : '00'
    const mins = parseInt(minsStrClean)
    if (nlpParsedPreview.time?.includes('PM') && hours < 12) hours += 12

    baseDate.setHours(hours, mins, 0, 0)
    const end = new Date(baseDate.getTime() + nlpParsedPreview.duration * 60 * 1000)

    if (nlpParsedPreview.type === 'event' || nlpInput.toLowerCase().includes('meeting')) {
      await createCalendarEvent({
        title: nlpParsedPreview.title,
        start_time: baseDate.toISOString(),
        end_time: end.toISOString(),
        event_type: 'personal',
        is_fixed: true,
        source: 'ai_suggested'
      })
    } else {
      await createTask({
        title: nlpParsedPreview.title,
        estimated_minutes: nlpParsedPreview.duration,
        scheduled_start: baseDate.toISOString(),
        scheduled_end: end.toISOString(),
        status: 'planned'
      })
    }

    setNlpInput('')
    setNlpParsedPreview(null)
    loadData()
  }

  // AI Day Builder - optimization generator
  const handleGenerateOptimizedPlan = () => {
    const todayEvents = events.filter(e => isSameDay(new Date(e.start_time), selectedDate))
    const unschedTasks = tasks.filter(t => !t.scheduled_start && t.status !== 'completed').slice(0, 3)

    const proposed: any[] = []
    let currentHour = 9

    // Place fixed events first
    todayEvents.forEach(e => {
      const start = new Date(e.start_time)
      const end = new Date(e.end_time)
      proposed.push({
        title: e.title,
        start,
        end,
        isFixed: true,
        type: 'event'
      })
    })

    // Fit tasks around them
    unschedTasks.forEach(task => {
      let slotFound = false
      while (!slotFound && currentHour < 18) {
        const slotStart = new Date(selectedDate)
        slotStart.setHours(currentHour, 0, 0, 0)
        const duration = task.estimated_minutes ?? 45
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000)

        const overlap = proposed.some(p => slotStart < p.end && slotEnd > p.start)
        if (!overlap) {
          proposed.push({
            id: task.id,
            title: task.title,
            start: slotStart,
            end: slotEnd,
            isFixed: false,
            type: 'task'
          })
          slotFound = true
        }
        currentHour++
      }
    })

    setProposedPlan(proposed.sort((a, b) => a.start.getTime() - b.start.getTime()))
  }

  const handleAcceptOptimizedPlan = async () => {
    if (!proposedPlan) return
    setIsOptimizerOpen(false)

    // Save proposed task schedules
    for (const item of proposedPlan) {
      if (item.type === 'task') {
        await updateTaskSchedule(item.id, item.start.toISOString(), item.end.toISOString())
      }
    }
    setProposedPlan(null)
    loadData()
  }

  // Brain Dump Mode
  const handleBrainDumpSubmit = async () => {
    if (!brainDumpText.trim()) return
    const items = brainDumpText.split(',').map(s => s.trim()).filter(Boolean)

    for (const item of items) {
      await createTask({
        title: item,
        status: 'inbox',
        priority: 'medium',
        estimated_minutes: 30
      })
    }
    setBrainDumpText('')
    loadData()
  }

  // AI Calendar Assistant state handlers
  const handleAskCalendar = async () => {
    if (!aiAssistantQuery.trim()) return
    setIsAiLoading(true)
    setAiAssistantResponse(null)

    setTimeout(() => {
      const q = aiAssistantQuery.toLowerCase()
      if (q.includes('workout') || q.includes('gym') || q.includes('training')) {
        setAiAssistantResponse("Your calendar has Training scheduled today at 4:30 PM. It is marked as Wellness and is flexible if needed.")
      } else if (q.includes('study') || q.includes('physics')) {
        setAiAssistantResponse("You have an open block today at 11:00 AM (2 hours available). That is the best window to study physics.")
      } else if (q.includes('overbooked') || q.includes('capacity')) {
        const cap = getCapacityDetails(selectedDate)
        setAiAssistantResponse(`Today's capacity is at ${cap.percentage}%. Your day is ${cap.status.toLowerCase()} with ${Math.round(cap.availableMinutes / 60)} hours free space.`)
      } else {
        setAiAssistantResponse("You are all set for today. You have 3 fixed events and 1 flexible task scheduled.")
      }
      setIsAiLoading(false)
    }, 800)
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Delete this event?')) {
      await deleteCalendarEvent(id)
      loadData()
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (confirm('Delete this task?')) {
      await deleteTask(id)
      loadData()
    }
  }

  // Confirming Structures Class Time
  const handleConfirmStructuresTime = (time: string) => {
    setStructuresTime(time)
    setIsStructuresConfirmed(true)
    localStorage.setItem('pos_structures_confirmed', 'true')
    localStorage.setItem('pos_structures_time', time)
    loadData()
  }

  // Confirming Second Job start date
  const handleConfirmSecondJobDate = (dateStr: string) => {
    setSecondJobStartDateConfirmed(dateStr)
    localStorage.setItem('pos_second_job_confirmed_start', dateStr)
    loadData()
  }

  // Dismissing conflict widget
  const handleResolveConflict = () => {
    setIsConflictDismissed(true)
    localStorage.setItem('pos_conflict_dismissed', 'true')
  }

  // Helper values
  const timelineItems = getTimelineItems(selectedDate)
  const capacity = getCapacityDetails(selectedDate)
  const nextUp = timelineItems.find(item => item.start.getTime() > currentTime.getTime())
  const missedTasks = getMissedTasks()
  const conflicts = getConflicts(selectedDate)

  // Calendar navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }
  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  // Get range bounds (7 AM to 10 PM)
  const hoursRange = Array.from({ length: 16 }, (_, i) => 7 + i) // 7 to 22

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#26352E] flex flex-col">

      {/* ─── FOCUS MODE DISTRACTION-FREE OVERLAY ──────────────────────────────── */}
      {activeFocusTask && (
        <div className="fixed inset-0 z-50 bg-[#26352E] text-[#F3F7F3] flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full text-center space-y-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#315C4A] text-[#E8F0EA] text-xs font-bold uppercase tracking-wider">
              <Zap size={12} className="animate-pulse" /> Focus Mode Active
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">{activeFocusTask.title}</h2>
              {activeFocusTask.description && (
                <p className="text-sm text-[#A8BDAF]">{activeFocusTask.description}</p>
              )}
            </div>

            {/* Timer circle visualization */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#718078" strokeWidth="2" />
                <circle
                  cx="18" cy="18" r="16" fill="none" stroke="#315C4A" strokeWidth="2.5"
                  strokeDasharray={`${(focusTimeRemaining / ((activeFocusTask.estimated_minutes ?? 25) * 60)) * 100} 100`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tight">
                  {Math.floor(focusTimeRemaining / 60)}:
                  {String(focusTimeRemaining % 60).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-[#A8BDAF] font-bold uppercase tracking-widest mt-1">minutes remaining</span>
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => setIsFocusPaused(!isFocusPaused)}
                className="bg-[#E8F0EA] text-[#315C4A] hover:bg-[#A8BDAF]"
              >
                {isFocusPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="primary"
                onClick={() => setFocusTimeRemaining(prev => prev + 300)}
                className="bg-transparent border border-[#718078] text-[#F3F7F3] hover:bg-[#718078]/20"
              >
                +5 Min
              </Button>
              <Button
                variant="secondary"
                onClick={handleCompleteFocusTask}
                className="bg-[#315C4A] hover:bg-[#26352E] text-white"
              >
                Complete
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveFocusTask(null)}
                className="text-[#A8BDAF] hover:bg-[#718078]/25"
              >
                Skip / Exit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CALENDAR HEADER & METRICS ────────────────────────────────────────── */}
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E8F0EA]">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-[#26352E] tracking-tight">My Life, Visualized.</h1>
            <p className="text-sm text-[#718078] font-medium">Unified daily planner, wellness, priorities, and schedule conflicts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode selector */}
            <div className="bg-[#E8F0EA] p-1 rounded-xl flex">
              {(['today', 'week', 'month', 'agenda'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-[#315C4A] text-white shadow-xs'
                      : 'text-[#718078] hover:text-[#26352E]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={() => setIsEventModalOpen(true)}
              icon={<Plus size={16} />}
              className="bg-[#315C4A] hover:bg-[#26352E]"
            >
              Event
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsTaskModalOpen(true)}
              icon={<Plus size={16} />}
            >
              Task
            </Button>
          </div>
        </header>

        {/* Color Coding Legend */}
        <div className="bg-white rounded-2xl border border-[#E8F0EA] p-3 flex flex-wrap gap-4 text-xs font-bold justify-center md:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#315C4A] border border-[#26352E]" />
            <span className="text-[#26352E]">School (Classes)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#5e6544] border border-[#2e2f22]" />
            <span className="text-[#26352E]">Work (Shifts)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#E8F0EA] border border-[#A8BDAF]" />
            <span className="text-[#315C4A]">Extra Activities & Wellness</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#a85d48] border border-[#8c4837]" />
            <span className="text-[#26352E]">Assignments & Tests</span>
          </div>
        </div>

        {/* ─── VIV OS INTERACTIVE DATA SETUPS / PENDING CONFIRMATIONS ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Structures Time pending */}
          {!isStructuresConfirmed && (
            <div className="bg-[#E8F0EA] border border-[#A8BDAF] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#315C4A]">
                <Clock size={16} />
                <span className="font-bold text-xs uppercase tracking-wide">Architectural Structures Time Pending</span>
              </div>
              <p className="text-xs text-[#718078]">
                ARCH-331 is scheduled on <strong>Tuesdays & Thursdays</strong> at room <strong>ARCC-105</strong>, but time is not confirmed.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  id="structures-time-input"
                  defaultValue="14:00"
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#A8BDAF] bg-white text-[#26352E]"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('structures-time-input') as HTMLInputElement
                    handleConfirmStructuresTime(input?.value || '14:00')
                  }}
                  className="px-3 py-1 bg-[#315C4A] hover:bg-[#26352E] text-white font-bold rounded-lg text-xs"
                >
                  Confirm Time
                </button>
              </div>
            </div>
          )}

          {/* 2. Second Job Start Date pending */}
          {!secondJobStartDateConfirmed && (
            <div className="bg-[#E8F0EA] border border-[#A8BDAF] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#315C4A]">
                <CalendarDays size={16} />
                <span className="font-bold text-xs uppercase tracking-wide">Second Job Start Date Pending</span>
              </div>
              <p className="text-xs text-[#718078]">
                Second Job is scheduled Mon/Wed 12 PM - 3 PM. Provided start date <strong>Sept 8, 2026</strong> is a Tuesday.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: 'Start Tue Sept 8', val: '2026-09-08' },
                  { label: 'Start Wed Sept 9', val: '2026-09-09' },
                  { label: 'Start Mon Sept 14', val: '2026-09-14' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => handleConfirmSecondJobDate(opt.val)}
                    className="px-2 py-1 bg-white hover:bg-[#A8BDAF]/30 text-[#315C4A] border border-[#A8BDAF] text-[10px] font-bold rounded-lg"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Conflict Resolver banner */}
        {!isConflictDismissed && (
          <div className="bg-[#a85d48]/10 border border-[#a85d48]/30 rounded-2xl p-4 space-y-3 text-[#a85d48] text-xs">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle size={16} />
              <span>WORK SCHEDULE CONFLICT DETECTED</span>
            </div>
            <p className="leading-relaxed">
              Viv, your <strong>Tech Shop shift (10:00 AM – 5:00 PM)</strong> overlaps with <strong>ARCH Design III (8:51 AM – 11:20 AM)</strong> and your <strong>Second Job (12:00 PM – 3:00 PM)</strong>. How would you like to handle this?
            </p>
            <div className="flex gap-2">
              <button onClick={handleResolveConflict} className="px-3 py-1.5 bg-[#a85d48] text-white font-bold rounded-xl text-[10px] hover:bg-[#26352E]">
                Resolve
              </button>
              <button onClick={handleResolveConflict} className="px-3 py-1.5 bg-white text-[#a85d48] border border-[#a85d48]/30 font-bold rounded-xl text-[10px] hover:bg-[#a85d48]/10">
                Keep Both
              </button>
              <button onClick={handleResolveConflict} className="px-3 py-1.5 bg-white text-[#a85d48] border border-[#a85d48]/30 font-bold rounded-xl text-[10px] hover:bg-[#a85d48]/10">
                Adjust Work Schedule
              </button>
              <button onClick={handleResolveConflict} className="px-3 py-1.5 bg-white text-[#a85d48] border border-[#a85d48]/30 font-bold rounded-xl text-[10px] hover:bg-[#a85d48]/10">
                Review Later
              </button>
            </div>
          </div>
        )}

        {/* ─── METRICS ROW: Capacity ring, Next up, Natural language Quick Add ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Widget 1: Capacity ring */}
          <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 flex items-center gap-5 shadow-xs">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#F3F7F3" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none" stroke="#315C4A" strokeWidth="3.5"
                  strokeDasharray={`${capacity.percentage} 100`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[#26352E]">{capacity.percentage}%</span>
                <span className="text-[8px] font-bold text-[#718078] uppercase tracking-wide">Capacity</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#718078] uppercase tracking-widest">Today's Load</p>
              <h4 className="text-base font-black text-[#26352E]">{capacity.status}</h4>
              <p className="text-xs text-[#718078] font-medium">
                {Math.round(capacity.plannedMinutes / 60)}h planned · {Math.round(capacity.availableMinutes / 60)}h available
              </p>
            </div>
          </div>

          {/* Widget 2: Next Up */}
          <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold text-[#718078] uppercase tracking-widest">Next Up</p>
              {nextUp && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E8F0EA] text-[#315C4A]">
                  {nextUp.isFixed ? 'Fixed' : 'Flexible'}
                </span>
              )}
            </div>
            {nextUp ? (
              <div className="flex items-center justify-between gap-3 mt-2">
                <div>
                  <h4 className="text-sm font-black text-[#26352E] truncate">{nextUp.title}</h4>
                  <p className="text-xs text-[#718078] font-medium mt-0.5">
                    Starts {nextUp.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {nextUp.itemType === 'task' && (
                  <button
                    onClick={() => handleStartFocus(nextUp.rawTask!)}
                    className="p-2 rounded-xl bg-[#315C4A] hover:bg-[#26352E] text-white transition-all shrink-0"
                    title="Start Focus Mode"
                  >
                    <Play size={14} fill="white" />
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <h4 className="text-sm font-black text-[#718078]">You're Free</h4>
                <p className="text-xs text-[#718078] font-medium mt-0.5">No upcoming tasks or commitments scheduled.</p>
              </div>
            )}
          </div>

          {/* Widget 3: Natural Language Quick Add */}
          <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 flex flex-col justify-between shadow-xs">
            <p className="text-[10px] font-bold text-[#718078] uppercase tracking-widest mb-1.5">Quick Add NLP Parser</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nlpInput}
                onChange={e => handleNlpChange(e.target.value)}
                placeholder="e.g. Study physics tomorrow at 4 for 1 hour"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E8F0EA] bg-[#F3F7F3] text-[#26352E] focus:outline-none focus:ring-1 focus:ring-[#315C4A]"
              />
              {nlpParsedPreview && (
                <button
                  onClick={handleAddNlpItem}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#315C4A] hover:bg-[#26352E] text-white transition-all"
                >
                  Add
                </button>
              )}
            </div>
            {nlpParsedPreview && (
              <div className="text-[10px] text-[#315C4A] font-bold mt-1.5 bg-[#E8F0EA] px-2 py-1 rounded-lg">
                Preview: {nlpParsedPreview.title} ({nlpParsedPreview.duration}m) · {nlpParsedPreview.day} at {nlpParsedPreview.time ?? 'flexible'}
              </div>
            )}
          </div>
        </div>

        {/* Missed Tasks / Conflict warnings */}
        {(missedTasks.length > 0 || conflicts.length > 0) && (
          <div className="bg-[#a85d48]/10 border border-[#a85d48]/30 rounded-2xl p-4 space-y-2 text-[#a85d48] text-xs">
            {missedTasks.map(t => (
              <div key={t.id} className="flex justify-between items-center">
                <span>⚠️ Missed Scheduled Task: <strong>{t.title}</strong></span>
                <button
                  onClick={() => handleAutoReschedule(t)}
                  className="px-2.5 py-1 bg-[#a85d48] text-white font-bold rounded-lg text-[10px] hover:bg-[#26352E]"
                >
                  Reschedule Tomorrow
                </button>
              </div>
            ))}
            {conflicts.map((c, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span>⚠️ Conflict: {c}</span>
              </div>
            ))}
          </div>
        )}

        {/* ─── VIEW 1: TODAY VIEW (TIMELINE) ────────────────────────────────────── */}
        {viewMode === 'today' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left/Middle Columns: Date switcher + Vertical Timeline */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8F0EA] p-4 flex items-center justify-between">
                <button onClick={handlePrevDay} className="p-2 hover:bg-[#F3F7F3] rounded-xl"><ChevronLeft size={16} /></button>
                <div className="text-center">
                  <h3 className="font-black text-sm text-[#26352E]">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-[10px] font-bold text-[#718078] uppercase tracking-wider mt-0.5">Today's Schedule</p>
                </div>
                <button onClick={handleNextDay} className="p-2 hover:bg-[#F3F7F3] rounded-xl"><ChevronRight size={16} /></button>
              </div>

              {/* Vertical Hour Timeline */}
              <div
                ref={timelineRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="bg-white rounded-2xl border border-[#E8F0EA] p-5 overflow-y-auto max-h-[600px] relative space-y-1 timeline-scrollbar"
              >
                {/* Live NOW indicator line */}
                {isSameDay(selectedDate, new Date()) && (
                  <div
                    ref={nowIndicatorRef}
                    className="absolute left-0 right-0 z-10 flex items-center"
                    style={{
                      top: `${((currentTime.getHours() - 7) * 60 + currentTime.getMinutes()) * 1.2}px`
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#a85d48] ml-3" />
                    <div className="flex-1 h-[2px] bg-[#a85d48]" />
                    <span className="text-[9px] font-bold text-[#a85d48] uppercase tracking-widest px-2.5 py-0.5 bg-[#FBFAF6] border border-[#a85d48] rounded-full mr-3 shadow-xs">
                      NOW · {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Display hours range with grid rows */}
                <div className="relative w-full" style={{ height: `${16 * 72}px` }}>
                  {hoursRange.map((hour, index) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-t border-[#F3F7F3] flex items-start pt-1.5"
                      style={{
                        top: `${index * 72}px`,
                        height: '72px'
                      }}
                    >
                      <span className="text-[10px] font-bold text-[#718078] w-12 text-right pr-3 select-none">
                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </span>
                    </div>
                  ))}

                  {/* Render timeline events & tasks */}
                  {timelineItems.map(item => {
                    const durationMinutes = (item.end.getTime() - item.start.getTime()) / (1000 * 60)
                    const startDiffMinutes = ((item.start.getHours() - 7) * 60) + item.start.getMinutes()
                    const top = startDiffMinutes * 1.2
                    const height = durationMinutes * 1.2

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.itemType === 'event') {
                            setEventToEdit(item.rawEvent!)
                            setIsEventModalOpen(true)
                          } else {
                            setTaskToEdit(item.rawTask!)
                            setIsTaskModalOpen(true)
                          }
                        }}
                        className={`absolute left-16 right-2 rounded-xl p-3 border shadow-xs cursor-pointer select-none transition-all hover:brightness-95 flex flex-col justify-between group overflow-hidden ${getItemStyles(item)}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="truncate">
                            <span className="text-xs font-black tracking-tight">{item.title}</span>
                            {item.description && (
                              <p className="text-[10px] opacity-80 truncate mt-0.5">{item.description}</p>
                            )}
                          </div>
                          {item.itemType === 'task' && item.rawTask?.status === 'completed' ? (
                            <CheckCircle2 size={13} className="text-[#315C4A] shrink-0" />
                          ) : (
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (item.itemType === 'event') handleDeleteEvent(item.id)
                                  else handleDeleteTask(item.id)
                                }}
                                className="p-1 rounded-md hover:bg-black/10 text-inherit"
                              >
                                <Trash size={10} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[9px] opacity-90 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {item.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                            {item.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {item.location && <span className="truncate">{item.location}</span>}
                        </div>
                      </div>
                    )
                  })}

                  {/* Render Sleep Window */}
                  <div
                    className="absolute left-16 right-2 rounded-xl p-3 bg-[#E8F0EA]/40 text-[#718078] border border-dashed border-[#A8BDAF] flex items-center justify-center pointer-events-none"
                    style={{
                      bottom: '0px',
                      height: '72px' // last hour 10 PM - 11 PM
                    }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Moon size={11} /> Protected Sleep Window
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar (Unscheduled, AI day optimizer, Assistant) */}
            <div className="space-y-6">

              {/* Sidebar Section 1: Unscheduled drawer */}
              <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#26352E]">To Schedule</h3>
                  <span className="text-[10px] bg-[#E8F0EA] text-[#315C4A] font-bold px-2 py-0.5 rounded-full">
                    {tasks.filter(t => !t.scheduled_start && t.status !== 'completed').length} pending
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {tasks.filter(t => !t.scheduled_start && t.status !== 'completed').map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="p-3 bg-[#F3F7F3] border border-[#E8F0EA] rounded-xl cursor-grab active:cursor-grabbing hover:border-[#A8BDAF] transition-all flex justify-between items-center group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#26352E] truncate">{task.title}</p>
                        <span className="text-[9px] text-[#718078]">{task.estimated_minutes ?? 30} mins · {task.priority}</span>
                      </div>

                      {/* Best fit for mobile/desktop tap options */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                             const fits = getBestFitSlots()
                             const firstFit = fits[0]
                             if (firstFit) {
                               handleApplyMobileFit(task.id, firstFit.start, task.estimated_minutes ?? 30)
                             }
                          }}
                          className="px-2 py-1 bg-[#315C4A] hover:bg-[#26352E] text-white text-[9px] font-bold rounded-lg transition-all"
                        >
                          Auto Fit
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => !t.scheduled_start && t.status !== 'completed').length === 0 && (
                    <p className="text-xs text-[#718078] py-4 text-center">No unscheduled priorities.</p>
                  )}
                </div>
              </div>

              {/* Sidebar Section 2: AI Day Builder & Brain Dump */}
              <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-black text-[#26352E] flex items-center gap-1.5">
                  <Sparkles size={15} className="text-[#315C4A]" /> AI Day Optimizer
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsOptimizerOpen(true)
                      handleGenerateOptimizedPlan()
                    }}
                    className="py-2 rounded-xl bg-[#315C4A] hover:bg-[#26352E] text-white text-xs font-bold transition-all text-center"
                  >
                    Plan My Day
                  </button>
                  <button
                    onClick={() => setIsOptimizerOpen(true)}
                    className="py-2 rounded-xl bg-[#E8F0EA] hover:bg-[#A8BDAF]/30 text-[#315C4A] text-xs font-bold transition-all text-center border border-[#A8BDAF]"
                  >
                    Brain Dump
                  </button>
                </div>
              </div>

              {/* Sidebar Section 3: AI Assistant */}
              <div className="bg-white rounded-2xl border border-[#E8F0EA] p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-black text-[#26352E]">Ask Your Calendar</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiAssistantQuery}
                      onChange={e => setAiAssistantQuery(e.target.value)}
                      placeholder="e.g. When should I study physics?"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E8F0EA] bg-[#F3F7F3] text-[#26352E] focus:outline-none"
                    />
                    <button
                      onClick={handleAskCalendar}
                      disabled={isAiLoading}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#315C4A] hover:bg-[#26352E] text-white"
                    >
                      Ask
                    </button>
                  </div>
                  {aiAssistantResponse && (
                    <div className="text-xs text-[#26352E] bg-[#E8F0EA] p-3 rounded-xl border border-[#A8BDAF] animate-slide-up">
                      {aiAssistantResponse}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW 2: WEEK VIEW ────────────────────────────────────────────────── */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-2xl border border-[#E8F0EA] p-6 space-y-6 shadow-xs">
            <div className="flex justify-between items-center pb-4 border-b border-[#E8F0EA]">
              <h3 className="text-base font-black text-[#26352E] flex items-center gap-2">
                <CalendarDays size={16} className="text-[#315C4A]" /> Weekly Capacity Overview
              </h3>
              <div className="text-right">
                <span className="text-xs font-semibold text-[#718078]">Weekly Target Load: <strong>2,400 min</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => {
                const day = new Date()
                day.setDate(day.getDate() - day.getDay() + 1 + i) // Mon - Fri
                const dayCap = getCapacityDetails(day)
                const dayItems = getTimelineItems(day)

                return (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedDate(day)
                      setViewMode('today')
                    }}
                    className="p-4 bg-[#F3F7F3] border border-[#E8F0EA] rounded-2xl hover:border-[#315C4A] transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#26352E]">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-[10px] font-bold text-[#718078]">
                        {day.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#718078]">
                        <span>Capacity</span>
                        <span className="font-bold text-[#315C4A]">{dayCap.percentage}%</span>
                      </div>
                      <ProgressBar value={dayCap.percentage} size="sm" />
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#E8F0EA]">
                      {dayItems.slice(0, 3).map(item => (
                        <div key={item.id} className="text-[10px] truncate text-[#26352E] font-medium flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(item)}`} />
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                      {dayItems.length === 0 && (
                        <p className="text-[9px] text-[#718078] italic">No commitments</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── VIEW 3: MONTH VIEW ───────────────────────────────────────────────── */}
        {viewMode === 'month' && (
          <div className="bg-white rounded-2xl border border-[#E8F0EA] p-6 shadow-xs">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#718078] border-b border-[#E8F0EA] pb-3 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => {
                const day = new Date()
                day.setDate(day.getDate() - day.getDay() + i - 10) // Render a grid centering today
                const dayItems = getTimelineItems(day)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedDate(day)
                      setViewMode('today')
                    }}
                    className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                      isToday
                        ? 'border-[#315C4A] bg-[#E8F0EA]/40'
                        : 'border-[#F3F7F3] hover:border-[#A8BDAF] bg-white'
                    }`}
                  >
                    <span className={`text-xs font-black self-end ${isToday ? 'text-[#315C4A]' : 'text-[#718078]'}`}>
                      {day.getDate()}
                    </span>

                    <div className="space-y-1 overflow-hidden mt-1 flex-1">
                      {dayItems.slice(0, 2).map(item => (
                         <div
                          key={item.id}
                          className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${getItemStyles(item)}`}
                        >
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <p className="text-[8px] text-[#718078] text-right font-semibold">+{dayItems.length - 2} more</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── VIEW 4: AGENDA VIEW ──────────────────────────────────────────────── */}
        {viewMode === 'agenda' && (
          <div className="bg-white rounded-2xl border border-[#E8F0EA] p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-black text-[#26352E] pb-3 border-b border-[#E8F0EA]">Agenda Commitments</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    setEventToEdit(evt)
                    setIsEventModalOpen(true)
                  }}
                  className="p-4 bg-[#F3F7F3] hover:bg-[#E8F0EA]/50 rounded-2xl border border-[#E8F0EA] transition-all flex justify-between items-start cursor-pointer"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#26352E]">{evt.title}</h4>
                    <p className="text-xs text-[#718078]">
                      {new Date(evt.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                      {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(evt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {evt.description && <p className="text-xs text-[#718078] mt-1">{evt.description}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    evt.is_fixed ? 'bg-[#315C4A] text-white' : 'bg-[#E8F0EA] text-[#315C4A]'
                  }`}>
                    {evt.is_fixed ? 'Fixed' : 'Flexible'}
                  </span>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-[#718078] py-8 text-center">No agenda events logged.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── OPTIMIZER PROPOSAL DIALOG ────────────────────────────────────────── */}
      <Modal
        isOpen={isOptimizerOpen}
        onClose={() => {
          setIsOptimizerOpen(false)
          setProposedPlan(null)
        }}
        title="AI Day Optimizer Proposed Plan"
      >
        <div className="space-y-5">
          {proposedPlan ? (
            <>
              <p className="text-xs text-[#718078]">
                We found matching slots for your high priority unscheduled tasks while fully protecting your fixed meetings and workouts. Review the optimization below:
              </p>
              <div className="space-y-2 border border-[#E8F0EA] p-3 rounded-2xl bg-[#F3F7F3]">
                {proposedPlan.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white rounded-xl border border-[#E8F0EA]">
                    <div>
                      <span className="font-bold text-[#26352E]">{item.title}</span>
                      <p className="text-[10px] text-[#718078]">
                        {item.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                        {item.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      item.isFixed ? 'bg-[#315C4A] text-white' : 'bg-[#A8BDAF] text-[#315C4A]'
                    }`}>
                      {item.type === 'event' ? 'Fixed' : 'Auto Fit'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsOptimizerOpen(false)
                    setProposedPlan(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleAcceptOptimizedPlan}
                  className="bg-[#315C4A] hover:bg-[#26352E]"
                >
                  Apply Changes
                </Button>
              </div>
            </>
          ) : (
            // Brain Dump Flow
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#718078] uppercase tracking-wide">
                Brain Dump — Type Everything You Need to Do
              </label>
              <textarea
                value={brainDumpText}
                onChange={e => setBrainDumpText(e.target.value)}
                placeholder="e.g. study physics, client strategy briefing, gym session, grocery shopping"
                rows={4}
                className="w-full rounded-2xl border border-[#E8F0EA] bg-[#F3F7F3] p-3 text-sm text-[#26352E] focus:outline-none"
              />
              <p className="text-[10px] text-[#718078] leading-normal">
                Enter tasks separated by commas. They will be added as unscheduled priorities which you can drag onto the timeline or auto-fit.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsOptimizerOpen(false)}>Cancel</Button>
                <Button variant="secondary" onClick={handleBrainDumpSubmit} className="bg-[#315C4A] hover:bg-[#26352E]">
                  Create Tasks
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Creation/Edit Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setEventToEdit(null)
        }}
        eventToEdit={eventToEdit}
        onEventSaved={loadData}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setTaskToEdit(null)
        }}
        taskToEdit={taskToEdit}
        onTaskSaved={loadData}
      />
    </div>
  )
}
