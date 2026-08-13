import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createAccount } from '@/services/financeService'

export interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onAccountSaved?: () => void
}

export function AccountModal({ isOpen, onClose, onAccountSaved }: AccountModalProps) {
  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'cash' | 'business' | 'other'>('checking')
  const [currentBalance, setCurrentBalance] = useState<number | ''>(0)
  const [institutionName, setInstitutionName] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Account name is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await createAccount({
        name: name.trim(),
        account_type: accountType,
        current_balance: currentBalance !== '' ? Number(currentBalance) : 0,
        institution_name: institutionName.trim() || null,
        notes: notes.trim() || null,
      })

      if (onAccountSaved) onAccountSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Financial Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Input
          label="Account Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Primary Checking / High Yield Savings"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#26352E] mb-1">
              Account Type *
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as any)}
              className="w-full rounded-xl border border-[#E8F0EA] bg-white px-3 py-2 text-sm font-semibold text-[#26352E] focus:ring-2 focus:ring-[#315C4A] focus:outline-none"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="cash">Cash / Emergency</option>
              <option value="business">Business</option>
              <option value="other">Other / Investment</option>
            </select>
          </div>

          <Input
            label="Current Balance ($) *"
            type="number"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value ? Number(e.target.value) : '')}
            placeholder="2500.00"
            required
            step="0.01"
          />
        </div>

        <Input
          label="Institution Name"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          placeholder="e.g. Chase / Fidelity / Ally"
        />

        <Input
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Account numbers or notes"
        />

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add Account
          </Button>
        </div>
      </form>
    </Modal>
  )
}
