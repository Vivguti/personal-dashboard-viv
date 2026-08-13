import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createBusinessProject, getClients, type Client } from '@/services/businessService'
import type { Priority } from '@/types'

export interface BusinessProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectSaved?: () => void
}

export function BusinessProjectModal({ isOpen, onClose, onProjectSaved }: BusinessProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [deadline, setDeadline] = useState('')

  const [clients, setClients] = useState<Client[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      getClients().then(setClients)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Business project title is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await createBusinessProject({
        title: title.trim(),
        description: description.trim() || null,
        client_id: clientId || null,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        status: 'planning',
      })

      if (onProjectSaved) onProjectSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create business project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Business Project">
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
          placeholder="e.g. Q3 Mobile App Redesign"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#26352E] mb-1">
              Client Link
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm font-semibold text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="">None (Internal)</option>
              {clients.map((c: Client) => (
                <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
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
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm font-semibold text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <Input
          label="Deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-[#26352E] mb-1">
            Description / Scope
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            placeholder="Project scope or deliverables..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
