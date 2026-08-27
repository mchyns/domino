import React from 'react';
import { cn } from '../../lib/utils';

interface TileBackProps {
  size?: 'sm' | 'md' | 'lg' | 'hand' | 'board';
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const TileBack: React.FC<TileBackProps> = ({
  size = 'sm',
  orientation = 'vertical',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-[18px] h-[36px]',
    md: 'w-[26px] h-[52px]',
    lg: 'w-[36px] h-[72px]',
    hand: 'w-[44px] h-[88px]',
    board: 'w-[38px] h-[76px]',
  };

  const horizontalSizeClasses = {
    sm: 'w-[36px] h-[18px]',
    md: 'w-[52px] h-[26px]',
    lg: 'w-[72px] h-[36px]',
    hand: 'w-[88px] h-[44px]',
    board: 'w-[76px] h-[38px]',
  };

  const isHorizontal = orientation === 'horizontal';
  const sizeClass = isHorizontal ? horizontalSizeClasses[size] : sizeClasses[size];

  return (
    <div
      className={cn(
        'relative inline-block select-none shadow-sm rounded-tile shrink-0 overflow-hidden',
        sizeClass,
        className
      )}
      aria-hidden="true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120" className="w-full h-full">
        <rect x="1" y="1" width="58" height="118" rx="8" ry="8"
          fill="var(--action-bg)" stroke="var(--border-color)" strokeWidth="1.5" />
        <rect x="6" y="6" width="48" height="108" rx="5" ry="5"
          fill="none" stroke="var(--accent-color)" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
    </div>
  );
};
