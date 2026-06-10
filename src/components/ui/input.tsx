import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'flex h-9 w-full rounded-md border border-outline bg-surface-bright px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all duration-150 ease-out-expo',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus:border-error focus:ring-error/30',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <div id={`${inputId}-error`} className="text-xs text-error" role="alert">
            {error}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
