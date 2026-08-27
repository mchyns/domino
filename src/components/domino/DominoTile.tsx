import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface DominoTileProps {
  a: number;
  b: number;
  displayLeft?: number;
  displayRight?: number;
  orientation?: 'vertical' | 'horizontal';
  isSelected?: boolean;
  isDisabled?: boolean;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hand' | 'board';
  onClick?: () => void;
  className?: string;
  animateEntrance?: boolean;
  entranceDelay?: number;
}

/* Pip positions for 0-6 on a 60×60 half-tile (center = 30,30) */
const PIP_POSITIONS: Record<number, [number, number][]> = {
  0: [],
  1: [[30, 30]],
  2: [[18, 18], [42, 42]],
  3: [[42, 18], [30, 30], [18, 42]],
  4: [[18, 18], [42, 18], [18, 42], [42, 42]],
  5: [[18, 18], [42, 18], [30, 30], [18, 42], [42, 42]],
  6: [[18, 18], [42, 18], [18, 30], [42, 30], [18, 42], [42, 42]],
};

function InlineDominoSvg({ topVal, bottomVal }: { topVal: number; bottomVal: number }) {
  const topPips = PIP_POSITIONS[topVal] || [];
  const bottomPips = PIP_POSITIONS[bottomVal] || [];

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120" className="w-full h-full">
      {/* Tile Body */}
      <rect
        x="1" y="1" width="58" height="118" rx="8" ry="8"
        className="fill-[var(--tile-bg)] stroke-[var(--tile-border)]"
        strokeWidth="1.5"
      />
      {/* Inner highlight */}
      <rect
        x="2" y="2" width="56" height="116" rx="7" ry="7"
        fill="none"
        className="stroke-[var(--tile-highlight)]"
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      {/* Groove */}
      <line x1="8" y1="60" x2="52" y2="60" className="stroke-[var(--tile-groove)]" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="61" x2="52" y2="61" className="stroke-[var(--tile-highlight)]" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
      {/* Top Pips */}
      {topPips.map(([cx, cy], i) => (
        <circle key={`t${i}`} cx={cx} cy={cy} r="4.25" className="fill-[var(--tile-pip)]" />
      ))}
      {/* Bottom Pips */}
      {bottomPips.map(([cx, cy], i) => (
        <circle key={`b${i}`} cx={cx} cy={cy + 60} r="4.25" className="fill-[var(--tile-pip)]" />
      ))}
    </svg>
  );
}

export const DominoTile: React.FC<DominoTileProps> = ({
  a,
  b,
  displayLeft,
  displayRight,
  orientation = 'vertical',
  isSelected = false,
  isDisabled = false,
  isPlayable = true,
  size = 'hand',
  onClick,
  className,
  animateEntrance = false,
  entranceDelay = 0,
}) => {
  const val1 = displayLeft !== undefined ? displayLeft : a;
  const val2 = displayRight !== undefined ? displayRight : b;

  // Size dimensions
  const sizeClasses = {
    sm: 'w-[28px] h-[56px]',
    md: 'w-[36px] h-[72px]',
    lg: 'w-[48px] h-[96px]',
    hand: 'w-[44px] h-[88px] sm:w-[50px] sm:h-[100px]',
    board: 'w-[38px] h-[76px] sm:w-[44px] sm:h-[88px]',
  };

  const horizontalSizeClasses = {
    sm: 'w-[56px] h-[28px]',
    md: 'w-[72px] h-[36px]',
    lg: 'w-[96px] h-[48px]',
    hand: 'w-[88px] h-[44px] sm:w-[100px] sm:h-[50px]',
    board: 'w-[76px] h-[38px] sm:w-[88px] sm:h-[44px]',
  };

  const isHorizontal = orientation === 'horizontal';
  const sizeClass = isHorizontal ? horizontalSizeClasses[size] : sizeClasses[size];

  // If display order is reversed (e.g. 5-2 but needs 2-5), flip
  const shouldFlip = val1 > val2;
  let rotateDeg = 0;
  if (isHorizontal) {
    rotateDeg = shouldFlip ? 270 : 90;
  } else {
    rotateDeg = shouldFlip ? 180 : 0;
  }

  const topVal = Math.min(val1, val2);
  const bottomVal = Math.max(val1, val2);

  const ariaLabel = `Domino ${val1} dan ${val2}`;

  return (
    <motion.div
      layout
      initial={animateEntrance ? { opacity: 0, y: 14, scale: 0.92 } : false}
      animate={{
        opacity: isDisabled ? 0.5 : 1,
        y: isSelected ? -10 : 0,
        scale: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 340,
        damping: 26,
        delay: entranceDelay,
      }}
      whileHover={
        !isDisabled && isPlayable && onClick
          ? { y: isSelected ? -10 : -4, transition: { duration: 0.15 } }
          : undefined
      }
      whileTap={
        !isDisabled && isPlayable && onClick
          ? { scale: 0.96 }
          : undefined
      }
      onClick={!isDisabled && isPlayable ? onClick : undefined}
      className={cn(
        'relative inline-block cursor-pointer select-none transition-shadow duration-200 shrink-0 touch-manipulation rounded-tile',
        sizeClass,
        isDisabled && 'cursor-not-allowed opacity-50 filter grayscale-[20%]',
        isSelected && 'z-20 shadow-tile-selected ring-2 ring-ink',
        !isDisabled && isPlayable && !isSelected && 'shadow-tile hover:shadow-tile-hover',
        className
      )}
      role="button"
      tabIndex={isDisabled || !isPlayable ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
    >
      <div
        className="w-full h-full flex items-center justify-center pointer-events-none"
        style={{
          transform: `rotate(${rotateDeg}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <InlineDominoSvg topVal={topVal} bottomVal={bottomVal} />
      </div>
    </motion.div>
  );
};
