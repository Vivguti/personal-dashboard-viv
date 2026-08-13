import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

  const variantClasses = {
    // Primary: light sage chip — readable on white cards
    primary:
      'bg-[#F3F7F3] text-[#26352E] hover:bg-[#E8F0EA] focus:ring-[#718078] shadow-xs border border-[#E8F0EA]',
    // Secondary: dark bark — high contrast CTA
    secondary:
      'bg-[#315C4A] text-white hover:bg-[#26352E] focus:ring-[#315C4A] border border-[#315C4A]',
    // Ghost: transparent sage text
    ghost:
      'bg-transparent text-[#315C4A] hover:bg-[#F3F7F3] focus:ring-[#E8F0EA]',
    danger: 'bg-[#26352E] text-white hover:bg-[#1a2520] focus:ring-[#26352E] border border-[#26352E]',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : icon ? (
        <span className="mr-2 flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
