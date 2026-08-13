import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  const variantClasses = {
    // Strictly greens and white:
    default: 'bg-[#F3F7F3] text-[#718078] border border-[#E8F0EA]',
    success: 'bg-[#E8F0EA] text-[#315C4A] border border-[#A8BDAF]',
    warning: 'bg-[#F3F7F3] text-[#315C4A] border border-[#E8F0EA]',
    danger: 'bg-[#26352E] text-white border border-[#26352E]',
    info: 'bg-[#E8F0EA] text-[#315C4A] border border-[#A8BDAF]',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-bold rounded-md',
    md: 'px-2.5 py-0.5 text-xs font-bold rounded-lg',
  };

  return (
    <span className={`inline-flex items-center font-bold tracking-tight ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
