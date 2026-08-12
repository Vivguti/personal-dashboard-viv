import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose() }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    full: 'max-w-full m-0 h-full rounded-none',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-[#2e2f22]/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative bg-white w-full sm:w-auto ${sizeClasses[size]}
          rounded-t-2xl sm:rounded-2xl shadow-xl border border-[#c4cfbc]
          flex flex-col max-h-[90vh]`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dfe8db]">
          {title ? (
            <h2 id="modal-title" className="text-lg font-black text-[#2e2f22]">{title}</h2>
          ) : <div />}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8c947d] hover:bg-[#dfe8db] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
