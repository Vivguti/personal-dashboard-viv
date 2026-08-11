import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  className?: string;
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
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  const hoverClasses = hoverable ? 'transition-shadow hover:shadow-md cursor-pointer' : '';
  const hasHeader = title || subtitle || icon || action;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${hoverClasses} ${className}`}>
      {hasHeader && (
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            {icon && <div className="text-indigo-600 dark:text-indigo-400 flex-shrink-0">{icon}</div>}
            <div>
              {title && <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={`${paddingClasses[padding]}`}>
        {children}
      </div>
    </div>
  );
}
