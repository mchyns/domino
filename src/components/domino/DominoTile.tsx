import React from 'react';
import { motion } from 'framer-motion';

type DominoPipValue = number;

export interface DominoTileProps {
  a: number;
  b: number;
  displayLeft?: number;
  displayRight?: number;
  orientation?: 'vertical' | 'horizontal';
  reversed?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hand' | 'board';
  onClick?: () => void;
  className?: string;
  animateEntrance?: boolean;
  entranceDelay?: number;
}

// Pip coordinates inside standard 60x60 square
const PIP_POSITIONS: Record<DominoPipValue, Array<[number, number]>> = {
  0: [],
  1: [[30, 30]],
  2: [
    [18, 18],
    [42, 42],
  ],
  3: [
    [18, 18],
    [30, 30],
    [42, 42],
  ],
  4: [
    [18, 18],
    [42, 18],
    [18, 42],
    [42, 42],
  ],
  5: [
    [18, 18],
    [42, 18],
    [30, 30],
    [18, 42],
    [42, 42],
  ],
  6: [
    [18, 16],
    [42, 16],
    [18, 30],
    [42, 30],
    [18, 44],
    [42, 44],
  ],
};

// Signature Higgs Domino Ruby Red Pip Color
const PIP_COLOR = '#A31D1D'; // Authentic deep ruby/crimson red
const PIP_CENTER_RED = '#B91C1C';

function InlineDominoSvg({
  val1,
  val2,
  isHorizontal,
}: {
  val1: number;
  val2: number;
  isHorizontal: boolean;
}) {
  const pips1 = PIP_POSITIONS[val1 as DominoPipValue] || [];
  const pips2 = PIP_POSITIONS[val2 as DominoPipValue] || [];

  if (isHorizontal) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 60"
        className="w-full h-full block"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.28))' }}
      >
        <defs>
          <linearGradient id="tileGradH" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FAF7EE" />
            <stop offset="100%" stopColor="#EDE7D8" />
          </linearGradient>
          <filter id="pipSunkenH" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0.8" stdDeviation="0.4" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Tile Body Horizontal */}
        <rect
          x="1"
          y="1"
          width="118"
          height="58"
          rx="7"
          ry="7"
          fill="url(#tileGradH)"
          stroke="#BDB5A2"
          strokeWidth="1.2"
        />

        {/* Inner 3D Highlight Ring */}
        <rect
          x="2.5"
          y="2.5"
          width="115"
          height="55"
          rx="5.5"
          ry="5.5"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.9"
          strokeWidth="1"
        />

        {/* Center Divider Groove Vertical */}
        <line
          x1="60"
          y1="5"
          x2="60"
          y2="55"
          stroke="#A39B87"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="61"
          y1="5"
          x2="61"
          y2="55"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />

        {/* Center Brass Spinner Pin */}
        <circle cx="60" cy="30" r="2.2" fill="#D4AF37" stroke="#8A6D1C" strokeWidth="0.6" />

        {/* Left Pips (Ruby Red) */}
        {pips1.map(([cx, cy], i) => (
          <circle
            key={`l${i}`}
            cx={cx}
            cy={cy}
            r={val1 === 1 ? '6.2' : '4.5'}
            fill={val1 === 1 ? PIP_CENTER_RED : PIP_COLOR}
            filter="url(#pipSunkenH)"
          />
        ))}

        {/* Right Pips (Ruby Red) */}
        {pips2.map(([cx, cy], i) => (
          <circle
            key={`r${i}`}
            cx={cx + 60}
            cy={cy}
            r={val2 === 1 ? '6.2' : '4.5'}
            fill={val2 === 1 ? PIP_CENTER_RED : PIP_COLOR}
            filter="url(#pipSunkenH)"
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 120"
      className="w-full h-full block"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.28))' }}
    >
      <defs>
        <linearGradient id="tileGradV" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#FAF7EE" />
          <stop offset="100%" stopColor="#EDE7D8" />
        </linearGradient>
        <filter id="pipSunkenV" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.8" stdDeviation="0.4" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Tile Body Vertical */}
      <rect
        x="1"
        y="1"
        width="58"
        height="118"
        rx="7"
        ry="7"
        fill="url(#tileGradV)"
        stroke="#BDB5A2"
        strokeWidth="1.2"
      />

      {/* Inner 3D Highlight Ring */}
      <rect
        x="2.5"
        y="2.5"
        width="55"
        height="115"
        rx="5.5"
        ry="5.5"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        strokeWidth="1"
      />

      {/* Center Divider Groove Horizontal */}
      <line
        x1="5"
        y1="60"
        x2="55"
        y2="60"
        stroke="#A39B87"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="61"
        x2="55"
        y2="61"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />

      {/* Center Brass Spinner Pin */}
      <circle cx="30" cy="60" r="2.2" fill="#D4AF37" stroke="#8A6D1C" strokeWidth="0.6" />

      {/* Top Pips (Ruby Red) */}
      {pips1.map(([cx, cy], i) => (
        <circle
          key={`t${i}`}
          cx={cx}
          cy={cy}
          r={val1 === 1 ? '6.2' : '4.5'}
          fill={val1 === 1 ? PIP_CENTER_RED : PIP_COLOR}
          filter="url(#pipSunkenV)"
        />
      ))}

      {/* Bottom Pips (Ruby Red) */}
      {pips2.map(([cx, cy], i) => (
        <circle
          key={`b${i}`}
          cx={cx}
          cy={cy + 60}
          r={val2 === 1 ? '6.2' : '4.5'}
          fill={val2 === 1 ? PIP_CENTER_RED : PIP_COLOR}
          filter="url(#pipSunkenV)"
        />
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
  reversed = false,
  isSelected = false,
  isDisabled = false,
  isPlayable = true,
  size = 'hand',
  onClick,
  className,
  animateEntrance = false,
  entranceDelay = 0,
}) => {
  const raw1 = displayLeft !== undefined ? displayLeft : a;
  const raw2 = displayRight !== undefined ? displayRight : b;

  const val1 = reversed ? raw2 : raw1;
  const val2 = reversed ? raw1 : raw2;

  const isHorizontal = orientation === 'horizontal';

  const sizeClasses = {
    sm: 'w-[28px] h-[56px]',
    md: 'w-[36px] h-[72px]',
    lg: 'w-[48px] h-[96px]',
    hand: 'w-[42px] h-[84px] sm:w-[48px] sm:h-[96px]',
    board: 'w-[32px] h-[64px]',
  };

  const horizontalSizeClasses = {
    sm: 'w-[56px] h-[28px]',
    md: 'w-[72px] h-[36px]',
    lg: 'w-[96px] h-[48px]',
    hand: 'w-[84px] h-[42px] sm:w-[96px] sm:h-[48px]',
    board: 'w-[64px] h-[32px]',
  };

  const sizeClass = isHorizontal ? horizontalSizeClasses[size] : sizeClasses[size];
  const ariaLabel = `Domino ${val1} dan ${val2}`;

  return (
    <motion.div
      layout
      initial={animateEntrance ? { opacity: 0, y: 14, scale: 0.92 } : false}
      animate={{
        opacity: isDisabled ? 0.45 : 1,
        y: isSelected ? -12 : 0,
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
          ? {
              y: -8,
              scale: 1.06,
              transition: { duration: 0.12 },
            }
          : undefined
      }
      whileTap={
        !isDisabled && isPlayable && onClick
          ? {
              scale: 0.96,
            }
          : undefined
      }
      onClick={!isDisabled && onClick ? onClick : undefined}
      aria-label={ariaLabel}
      className={`
        relative select-none shrink-0 transition-shadow duration-200
        ${sizeClass}
        ${isPlayable && !isDisabled ? 'cursor-pointer' : 'cursor-default'}
        ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent shadow-xl rounded-lg' : ''}
        ${isPlayable && !isSelected ? 'hover:shadow-lg' : ''}
        ${className || ''}
      `}
    >
      <InlineDominoSvg
        val1={val1}
        val2={val2}
        isHorizontal={isHorizontal}
      />
    </motion.div>
  );
};
