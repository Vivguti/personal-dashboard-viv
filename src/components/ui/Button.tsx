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
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

  const variantClasses = {
    primary:
      'bg-[#d6c7ad] text-[#2e2f22] hover:bg-[#b7c3a1] focus:ring-[#d6c7ad] shadow-xs border border-[#b7c3a1]/60',
    secondary:
      'bg-[#f5e8d0] text-[#2e2f22] hover:bg-[#d6c7ad] focus:ring-[#d6c7ad] border border-[#d6c7ad] dark:bg-[#2e2f22] dark:text-[#f5e8d0] dark:border-[#5e6544]',
    ghost:
      'bg-transparent text-[#2e2f22] hover:bg-[#f5e8d0] focus:ring-[#d6c7ad] dark:text-[#b7c3a1] dark:hover:bg-[#23241a]',
    danger: 'bg-[#a85d48] text-white hover:bg-[#8c4735] focus:ring-[#a85d48]',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4.5 py-2 text-sm min-h-[44px]',
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
