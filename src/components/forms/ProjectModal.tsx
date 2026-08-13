import { useState, useEffect } from 'react'
import type { Project, Goal, Priority } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createProject, updateProject } from '@/services/projectsService'
import { getGoals } from '@/services/goalsService'
import { getLifeAreas, type LifeAreaRow } from '@/services/lifeAreasService'

export interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectToEdit?: Project | null
  onProjectSaved?: (savedProject: Project) => void
}

export function ProjectModal({ isOpen, onClose, projectToEdit, onProjectSaved }: ProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalId, setGoalId] = useState('')
  const [lifeAreaId, setLifeAreaId] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [deadline, setDeadline] = useState('')

  const [goals, setGoals] = useState<Goal[]>([])
  const [lifeAreas, setLifeAreas] = useState<LifeAreaRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      getGoals().then(setGoals)
      getLifeAreas().then(setLifeAreas)

      if (projectToEdit) {
        setTitle(projectToEdit.title)
        setDescription(projectToEdit.description ?? '')
        setGoalId(projectToEdit.goal_id ?? '')
        setLifeAreaId(projectToEdit.life_area_id ?? '')
        setPriority(projectToEdit.priority)
        setDeadline(projectToEdit.deadline ? projectToEdit.deadline.slice(0, 16) : '')
      } else {
        setTitle('')
        setDescription('')
        setGoalId('')
        setLifeAreaId('')
        setPriority('medium')
        setDeadline('')
      }
      setError(null)
    }
  }, [isOpen, projectToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Project title is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        goal_id: goalId || null,
        life_area_id: lifeAreaId || null,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      }

      let saved: Project | null = null
      if (projectToEdit) {
        saved = await updateProject(projectToEdit.id, payload)
      } else {
        saved = await createProject(payload)
      }

      if (saved && onProjectSaved) {
        onProjectSaved(saved)
      }
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={projectToEdit ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Input
          label="Project Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Launch Mobile App"
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
            placeholder="Project details or scope..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#26352E] mb-1">
              Goal Link
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="">None (Independent)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

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
        </div>

        <div className="grid grid-cols-2 gap-3">
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

          <Input
            label="Deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {projectToEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
