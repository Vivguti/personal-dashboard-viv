import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
}

export function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  padding = 'md',
  hoverable = false,
  className = '',
}: CardProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-7',
  }

  const hoverClasses = hoverable
    ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
    : ''
  const hasHeader = title || subtitle || icon || action

  return (
    <div
      className={`bg-white dark:bg-[#1c2722] rounded-2xl subtle-shadow border border-[#dce5de] dark:border-[#2b3c33] overflow-hidden ${hoverClasses} ${className}`}
    >
      {hasHeader && (
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-[#f3f7f3] dark:border-[#26352e]">
          <div className="flex items-center gap-3">
            {icon && <div className="text-[#315c4a] dark:text-[#a8bdaf] flex-shrink-0">{icon}</div>}
            <div>
              {title && (
                <h3 className="font-bold text-[#26352e] dark:text-[#f3f7f3] text-base leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#718078] dark:text-[#a8bdaf] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={`${paddingClasses[padding]}`}>{children}</div>
    </div>
  )
}
