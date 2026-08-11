import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const baseInputClasses = 'block w-full rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 sm:text-sm transition-colors min-h-[44px]';
    
    const borderClasses = error
      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:text-red-100 dark:focus:border-red-500 dark:focus:ring-red-500'
      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-500';

    const paddingClasses = icon ? 'pl-10 pr-3 py-2' : 'px-3 py-2';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                {icon}
              </span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${baseInputClasses} ${borderClasses} ${paddingClasses} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" id={errorId}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400" id={helperId}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
