import { useState, useEffect } from 'react'
import type { Task, Priority, EnergyLevel, Project } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createTask, updateTask } from '@/services/tasksService'
import { getProjects, createProject } from '@/services/projectsService'

export interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  taskToEdit?: Task | null
  onTaskSaved?: (savedTask: Task) => void
}

export function TaskModal({ isOpen, onClose, taskToEdit, onTaskSaved }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectInput, setProjectInput] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [energyRequired, setEnergyRequired] = useState<EnergyLevel>('medium')
  
  // Time duration in hours and minutes
  const [estHours, setEstHours] = useState<number>(0)
  const [estMinutes, setEstMinutes] = useState<number>(30)
  const [actHours, setActHours] = useState<number>(0)
  const [actMinutes, setActMinutes] = useState<number>(0)
  
  const [deadline, setDeadline] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')

  const [projects, setProjects] = useState<Project[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      getProjects().then(fetchedProjects => {
        setProjects(fetchedProjects)
        if (taskToEdit) {
          const proj = fetchedProjects.find(p => p.id === taskToEdit.project_id)
          setProjectInput(proj ? proj.title : '')
        }
      })

      if (taskToEdit) {
        setTitle(taskToEdit.title)
        setDescription(taskToEdit.description ?? '')
        
        // Convert total estimated minutes to hours + minutes
        const totalEst = taskToEdit.estimated_minutes ?? 30
        setEstHours(Math.floor(totalEst / 60))
        setEstMinutes(totalEst % 60)
        
        // Convert total actual minutes to hours + minutes
        const totalAct = taskToEdit.actual_minutes ?? 0
        setActHours(Math.floor(totalAct / 60))
        setActMinutes(totalAct % 60)
        
        setPriority(taskToEdit.priority)
        setEnergyRequired(taskToEdit.energy_required)
        setDeadline(taskToEdit.deadline ? taskToEdit.deadline.slice(0, 16) : '')
        setScheduledStart(taskToEdit.scheduled_start ? taskToEdit.scheduled_start.slice(0, 16) : '')
      } else {
        setTitle('')
        setDescription('')
        setProjectInput('')
        setEstHours(0)
        setEstMinutes(30)
        setActHours(0)
        setActMinutes(0)
        setPriority('medium')
        setEnergyRequired('medium')
        setDeadline('')
        setScheduledStart('')
      }
      setError(null)
    }
  }, [isOpen, taskToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Task title is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // 1. Resolve or dynamically create the Project by name
      let finalProjectId: string | null = null
      if (projectInput.trim()) {
        const existing = projects.find(p => p.title.toLowerCase() === projectInput.trim().toLowerCase())
        if (existing) {
          finalProjectId = existing.id
        } else {
          try {
            const newProj = await createProject({ title: projectInput.trim() })
            if (newProj) {
              finalProjectId = newProj.id
            }
          } catch {
            // Fallback for demo/offline mode
            finalProjectId = `demo-proj-${Date.now()}`
          }
        }
      }

      // Calculate total minutes from hours + minutes inputs
      const estimatedMinutes = (estHours * 60) + estMinutes
      const actualMinutes = (actHours * 60) + actMinutes

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        project_id: finalProjectId,
        goal_id: null, // Removed field
        life_area_id: null, // Removed field
        priority,
        energy_required: energyRequired,
        estimated_minutes: estimatedMinutes,
        actual_minutes: actualMinutes,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        scheduled_start: scheduledStart ? new Date(scheduledStart).toISOString() : null,
      }

      let saved: Task | null = null
      if (taskToEdit) {
        saved = await updateTask(taskToEdit.id, payload)
      } else {
        saved = await createTask(payload)
      }

      if (saved && onTaskSaved) {
        onTaskSaved(saved)
      }
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#a85d48]/10 border border-[#a85d48]/30 text-[#a85d48] rounded-xl text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
        />

        <div>
          <label className="block text-xs font-bold text-[#718078] uppercase tracking-wide mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#E8F0EA] bg-[#FFFFFF] px-3 py-2 text-sm text-[#26352E] focus:ring-1 focus:ring-[#315C4A] focus:outline-none placeholder-[#718078]/60"
            placeholder="Additional notes..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#718078] uppercase tracking-wide mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-1 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#718078] uppercase tracking-wide mb-1">
              Energy Required
            </label>
            <select
              value={energyRequired}
              onChange={(e) => setEnergyRequired(e.target.value as EnergyLevel)}
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-1 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="low">Low Energy</option>
              <option value="medium">Medium Energy</option>
              <option value="high">High Energy</option>
            </select>
          </div>
        </div>

        {/* Duration picker in Hours and Minutes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#718078] uppercase tracking-wide">
              Est. Duration
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={estHours}
                  onChange={(e) => setEstHours(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-1.5 text-xs text-[#26352E]"
                  placeholder="Hrs"
                  min={0}
                />
                <span className="text-[9px] text-[#718078] font-bold uppercase mt-0.5 block text-center">Hours</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={estMinutes}
                  onChange={(e) => setEstMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                  className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-1.5 text-xs text-[#26352E]"
                  placeholder="Min"
                  min={0}
                  max={59}
                />
                <span className="text-[9px] text-[#718078] font-bold uppercase mt-0.5 block text-center">Minutes</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#718078] uppercase tracking-wide">
              Actual Time
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={actHours}
                  onChange={(e) => setActHours(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-1.5 text-xs text-[#26352E]"
                  placeholder="Hrs"
                  min={0}
                />
                <span className="text-[9px] text-[#718078] font-bold uppercase mt-0.5 block text-center">Hours</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={actMinutes}
                  onChange={(e) => setActMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                  className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-1.5 text-xs text-[#26352E]"
                  placeholder="Min"
                  min={0}
                  max={59}
                />
                <span className="text-[9px] text-[#718078] font-bold uppercase mt-0.5 block text-center">Minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project - Fill in the blank text input */}
        <Input
          label="Project (Fill in the blank)"
          value={projectInput}
          onChange={(e) => setProjectInput(e.target.value)}
          placeholder="e.g. Architecture Studio, Personal OS"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Input
            label="Schedule Start"
            type="datetime-local"
            value={scheduledStart}
            onChange={(e) => setScheduledStart(e.target.value)}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-[#315C4A] hover:bg-[#26352E] text-white border-none font-bold"
          >
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
