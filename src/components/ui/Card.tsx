import type { ReactNode } from 'react'

// Green palette: White cards, #c4cfbc borders, #2e2f22 headings, #8c947d labels
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
  const paddingClasses = { none: 'p-0', sm: 'p-3.5', md: 'p-5', lg: 'p-7' }
  const hoverClasses = hoverable
    ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
    : ''
  const hasHeader = title || subtitle || icon || action

  return (
    <div className={`bg-white rounded-2xl subtle-shadow border border-[#c4cfbc] overflow-hidden ${hoverClasses} ${className}`}>
      {hasHeader && (
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-[#dfe8db]">
          <div className="flex items-center gap-3">
            {icon && <div className="text-[#8c947d] flex-shrink-0">{icon}</div>}
            <div>
              {title && <h3 className="font-bold text-[#2e2f22] text-base leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-[#8c947d] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  )
}
