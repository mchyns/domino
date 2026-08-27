import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

    const variants = {
      primary:
        'bg-action text-action-text hover:bg-action-hover active:opacity-90 shadow-sm font-semibold',
      secondary:
        'bg-surface-secondary text-ink hover:bg-surface-tertiary border border-border/70 font-medium',
      outline:
        'bg-transparent text-ink border border-border hover:bg-surface-secondary hover:border-border-dark',
      ghost:
        'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-secondary',
      danger:
        'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 shadow-sm',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs rounded-btn gap-1.5',
      md: 'h-11 px-5 text-sm rounded-btn gap-2 min-h-[44px]',
      lg: 'h-13 px-6 text-base rounded-btn gap-2.5 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
