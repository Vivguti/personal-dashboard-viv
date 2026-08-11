import { useState, useEffect } from 'react'
import type { Task, Priority, EnergyLevel, Project, Goal } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createTask, updateTask } from '@/services/tasksService'
import { getProjects } from '@/services/projectsService'
import { getGoals } from '@/services/goalsService'
import { getLifeAreas, type LifeAreaRow } from '@/services/lifeAreasService'

export interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  taskToEdit?: Task | null
  onTaskSaved?: (savedTask: Task) => void
}

export function TaskModal({ isOpen, onClose, taskToEdit, onTaskSaved }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [goalId, setGoalId] = useState<string>('')
  const [lifeAreaId, setLifeAreaId] = useState<string>('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [energyRequired, setEnergyRequired] = useState<EnergyLevel>('medium')
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30)
  const [actualMinutes, setActualMinutes] = useState<number>(0)
  const [deadline, setDeadline] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')

  const [projects, setProjects] = useState<Project[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [lifeAreas, setLifeAreas] = useState<LifeAreaRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      getProjects().then(setProjects)
      getGoals().then(setGoals)
      getLifeAreas().then(setLifeAreas)

      if (taskToEdit) {
        setTitle(taskToEdit.title)
        setDescription(taskToEdit.description ?? '')
        setProjectId(taskToEdit.project_id ?? '')
        setGoalId(taskToEdit.goal_id ?? '')
        setLifeAreaId(taskToEdit.life_area_id ?? '')
        setPriority(taskToEdit.priority)
        setEnergyRequired(taskToEdit.energy_required)
        setEstimatedMinutes(taskToEdit.estimated_minutes ?? 30)
        setActualMinutes(taskToEdit.actual_minutes ?? 0)
        setDeadline(taskToEdit.deadline ? taskToEdit.deadline.slice(0, 16) : '')
        setScheduledStart(taskToEdit.scheduled_start ? taskToEdit.scheduled_start.slice(0, 16) : '')
      } else {
        setTitle('')
        setDescription('')
        setProjectId('')
        setGoalId('')
        setLifeAreaId('')
        setPriority('medium')
        setEnergyRequired('medium')
        setEstimatedMinutes(30)
        setActualMinutes(0)
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

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        project_id: projectId || null,
        goal_id: goalId || null,
        life_area_id: lifeAreaId || null,
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
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            placeholder="Additional notes..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Energy Required
            </label>
            <select
              value={energyRequired}
              onChange={(e) => setEnergyRequired(e.target.value as EnergyLevel)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="low">Low Energy</option>
              <option value="medium">Medium Energy</option>
              <option value="high">High Energy</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Est. Duration (min)"
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            min={1}
          />
          <Input
            label="Actual Time (min)"
            type="number"
            value={actualMinutes}
            onChange={(e) => setActualMinutes(Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="">None</option>
              {projects.map((p: Project) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goal
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="">None</option>
              {goals.map((g: Goal) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
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
              {lifeAreas.map((la: LifeAreaRow) => (
                <option key={la.id} value={la.id}>{la.name}</option>
              ))}
            </select>
          </div>
        </div>

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
          <Button type="submit" isLoading={isSubmitting}>
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
