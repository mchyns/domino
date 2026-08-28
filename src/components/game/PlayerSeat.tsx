import React, { useState, useEffect } from 'react';
import { PlayerPublicInfo } from '../../engine/types';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { soundFx } from '../../engine/audio';

interface PlayerSeatProps {
  player: PlayerPublicInfo;
  isCurrentTurn: boolean;
  position?: 'top' | 'left' | 'right' | 'bottom';
  turnDeadline?: number;
  turnDuration?: number;
  className?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
  turnDeadline,
  turnDuration = 15000,
  className,
}) => {
  const initial = player.nickname.charAt(0).toUpperCase() || 'P';
  const tileCount = Math.max(0, player.tileCount);
  const isBotPlayer = player.isBot;

  const [timeLeftMs, setTimeLeftMs] = useState(turnDuration);

  useEffect(() => {
    if (!isCurrentTurn || !turnDeadline) {
      setTimeLeftMs(turnDuration);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, turnDeadline - Date.now());
      setTimeLeftMs(remaining);

      // Play tick-tock audio during last 5 seconds
      const sec = Math.ceil(remaining / 1000);
      if (sec <= 5 && sec > 0 && remaining % 1000 < 250) {
        soundFx.playTickSound(sec <= 3);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isCurrentTurn, turnDeadline, turnDuration]);

  const secondsLeft = Math.ceil(timeLeftMs / 1000);
  const progressFraction = Math.min(1, Math.max(0, timeLeftMs / turnDuration));

  // Color transitions from Emerald -> Amber -> Crimson
  const ringColor =
    secondsLeft <= 4
      ? '#EF4444' // Red alert
      : secondsLeft <= 8
      ? '#F59E0B' // Amber warning
      : '#10B981'; // Emerald calm

  // SVG Circular progress radius
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressFraction);

  return (
    <motion.div
      layout
      className={cn(
        'relative flex flex-col items-center justify-center select-none z-20 transition-all duration-200',
        className
      )}
      animate={{
        scale: isCurrentTurn ? 1.08 : 1,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {/* Avatar Container with SVG Circular Progress Ring */}
      <div className="relative flex items-center justify-center">
        {/* Animated Countdown Progress Ring on Turn */}
        {isCurrentTurn && (
          <svg
            className="absolute -inset-1.5 sm:-inset-2 w-[calc(100%+12px)] sm:w-[calc(100%+16px)] h-[calc(100%+12px)] sm:h-[calc(100%+16px)] pointer-events-none -rotate-90 z-10"
            viewBox="0 0 60 60"
          >
            {/* Background Ring Track */}
            <circle
              cx="30"
              cy="30"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="3"
            />
            {/* Active Countdown Ring */}
            <circle
              cx="30"
              cy="30"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.2s linear, stroke 0.3s ease',
                filter: `drop-shadow(0 0 6px ${ringColor})`,
              }}
            />
          </svg>
        )}

        {/* Avatar Bubble */}
        <div
          className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold flex items-center justify-center text-sm sm:text-base border-2 shadow-lg transition-all',
            isCurrentTurn
              ? 'border-amber-300 bg-amber-500 text-white'
              : isBotPlayer
              ? 'border-emerald-600 bg-emerald-900/90 text-emerald-100'
              : 'border-emerald-700/60 bg-emerald-950/90 text-emerald-100'
          )}
          style={{
            boxShadow: isCurrentTurn
              ? '0 0 16px rgba(251, 191, 36, 0.6)'
              : '0 4px 10px rgba(0,0,0,0.4)',
          }}
        >
          {isBotPlayer ? (
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />
          ) : (
            initial
          )}
        </div>

        {/* Remaining Tile Count Red Badge */}
        <div
          className="absolute -top-1 -right-1 sm:-right-2 bg-gradient-to-r from-red-600 to-rose-700 text-white font-mono font-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full border border-red-400/80 shadow-md flex items-center gap-0.5 z-20"
          title={`${tileCount} kartu tersisa`}
        >
          <span>{tileCount}</span>
        </div>

        {/* Connection status indicator dot */}
        <span
          className={cn(
            'absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-emerald-950 z-20',
            isBotPlayer
              ? 'bg-emerald-400'
              : player.isConnected
              ? 'bg-emerald-400'
              : 'bg-amber-400'
          )}
          title={isBotPlayer ? 'AI Bot' : player.isConnected ? 'Terhubung' : 'Terputus'}
        />

        {/* Seconds countdown timer pill below avatar when active */}
        {isCurrentTurn && (
          <div
            className="absolute -bottom-3 bg-neutral-950/90 text-white font-mono font-bold text-[9px] px-1.5 py-0.2 rounded-full border shadow-md z-20"
            style={{ borderColor: ringColor, color: ringColor }}
          >
            {secondsLeft}s
          </div>
        )}
      </div>

      {/* Nickname & Host / Bot Tag */}
      <div className="flex flex-col items-center text-center mt-2 max-w-[76px] sm:max-w-[90px]">
        <span
          className={cn(
            'font-bold text-[11px] sm:text-xs truncate w-full leading-tight drop-shadow-md',
            isCurrentTurn ? 'text-amber-300 font-extrabold' : 'text-emerald-100/90'
          )}
        >
          {player.nickname}
        </span>
        {player.isHost ? (
          <span className="text-[9px] font-semibold text-amber-400/80 uppercase tracking-tighter leading-none">
            Host
          </span>
        ) : isBotPlayer ? (
          <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-tighter leading-none">
            🤖 AI
          </span>
        ) : null}
      </div>
    </motion.div>
  );
};
