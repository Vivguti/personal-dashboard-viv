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
      'bg-[#dfe8db] text-[#2e2f22] hover:bg-[#c4cfbc] focus:ring-[#8c947d] shadow-xs border border-[#c4cfbc]',
    // Secondary: dark bark — high contrast CTA
    secondary:
      'bg-[#5e6544] text-white hover:bg-[#2e2f22] focus:ring-[#5e6544] border border-[#5e6544]',
    // Ghost: transparent sage text
    ghost:
      'bg-transparent text-[#5e6544] hover:bg-[#dfe8db] focus:ring-[#c4cfbc]',
    danger: 'bg-[#a85d48] text-white hover:bg-[#8c4735] focus:ring-[#a85d48]',
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
