import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn('relative flex p-1 rounded-btn border w-full select-none', className)}
      style={{
        backgroundColor: 'var(--bg-surface-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex-1 py-2 px-3 text-xs sm:text-sm font-medium transition-colors duration-150 z-10 flex flex-col items-center justify-center min-h-[42px]'
            )}
            style={{
              color: isSelected ? 'var(--text-ink)' : 'var(--text-ink-secondary)',
              fontWeight: isSelected ? 600 : 500,
            }}
          >
            {isSelected && (
              <motion.div
                layoutId="segment-indicator"
                className="absolute inset-0 rounded-[8px] shadow-sm border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
            {option.sublabel && (
              <span className="relative z-10 text-[10px] mt-0.5" style={{ color: 'var(--text-ink-muted)' }}>
                {option.sublabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
