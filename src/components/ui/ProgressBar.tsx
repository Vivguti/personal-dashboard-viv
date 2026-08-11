export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  color?: string; // Tailwind color class or hex, defaults to indigo
  size?: 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'bg-indigo-600 dark:bg-indigo-500',
  size = 'md',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const percentage = (value / max) * 100;
  const clampedValue = Math.min(Math.max(percentage, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showLabel && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
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
  );
};
