import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createLead } from '@/services/businessService'

export interface LeadModalProps {
  isOpen: boolean
  onClose: () => void
  onLeadSaved?: () => void
}

export function LeadModal({ isOpen, onClose, onLeadSaved }: LeadModalProps) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState('')
  const [estimatedValue, setEstimatedValue] = useState<number | ''>('')
  const [status, setStatus] = useState<'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'>('new')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Lead name is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await createLead({
        name: name.trim(),
        company: company.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        source: source.trim() || null,
        estimated_value: estimatedValue !== '' ? Number(estimatedValue) : null,
        status,
        notes: notes.trim() || null,
      })

      if (onLeadSaved) onLeadSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Lead Opportunity">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Lead Opportunity Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Website Redesign Project"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Global Tech"
          />

          <Input
            label="Lead Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Referral / Website"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Est. Value ($)"
            type="number"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value ? Number(e.target.value) : '')}
            placeholder="3500.00"
            min={0}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pipeline Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="new">New Inquiry</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal Sent</option>
              <option value="won">Won (Converted)</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Contact Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@company.com"
          />
          <Input
            label="Contact Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 019-2834"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            placeholder="Opportunity details..."
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add Lead
          </Button>
        </div>
      </form>
    </Modal>
  )
}
