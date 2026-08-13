// Green palette progress bar: #E8F0EA track, #315C4A fill
export interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  size?: 'sm' | 'md'
  showLabel?: boolean
  label?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  color = 'bg-[#315C4A]',
  size = 'md',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const percentage = (value / max) * 100
  const clampedValue = Math.min(Math.max(percentage, 0), 100)
  const sizeClasses = { sm: 'h-1.5', md: 'h-2.5' }

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs font-bold text-[#718078]">{label}</span>}
          {showLabel && <span className="text-xs font-bold text-[#718078]">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#E8F0EA] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
