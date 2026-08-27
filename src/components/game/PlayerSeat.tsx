import React from 'react';
import { PlayerPublicInfo } from '../../engine/types';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface PlayerSeatProps {
  player: PlayerPublicInfo;
  isCurrentTurn: boolean;
  position?: 'top' | 'left' | 'right' | 'bottom';
  className?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
  className,
}) => {
  const initial = player.nickname.charAt(0).toUpperCase() || 'P';
  const tileCount = Math.max(0, player.tileCount);

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
      {/* Avatar Container with Higgs Domino style card counter badge */}
      <div className="relative">
        <div
          className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold flex items-center justify-center text-sm sm:text-base border-2 shadow-lg transition-all',
            isCurrentTurn
              ? 'ring-4 ring-amber-400/80 border-amber-300 bg-amber-500 text-white animate-pulse'
              : 'border-emerald-700/60 bg-emerald-950/90 text-emerald-100'
          )}
          style={{
            boxShadow: isCurrentTurn
              ? '0 0 16px rgba(251, 191, 36, 0.6)'
              : '0 4px 10px rgba(0,0,0,0.4)',
          }}
        >
          {initial}
        </div>

        {/* Remaining Tile Count Red Badge (Higgs Domino signature red pill) */}
        <div
          className="absolute -top-1 -right-1 sm:-right-2 bg-gradient-to-r from-red-600 to-rose-700 text-white font-mono font-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full border border-red-400/80 shadow-md flex items-center gap-0.5"
          title={`${tileCount} kartu tersisa`}
        >
          <span>{tileCount}</span>
        </div>

        {/* Connection status indicator dot */}
        <span
          className={cn(
            'absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-emerald-950',
            player.isConnected ? 'bg-emerald-400' : 'bg-amber-400'
          )}
          title={player.isConnected ? 'Terhubung' : 'Terputus'}
        />
      </div>

      {/* Nickname & Host Tag below avatar */}
      <div className="flex flex-col items-center text-center mt-1 max-w-[76px] sm:max-w-[90px]">
        <span
          className={cn(
            'font-bold text-[11px] sm:text-xs truncate w-full leading-tight drop-shadow-md',
            isCurrentTurn ? 'text-amber-300 font-extrabold' : 'text-emerald-100/90'
          )}
        >
          {player.nickname}
        </span>
        {player.isHost && (
          <span className="text-[9px] font-semibold text-amber-400/80 uppercase tracking-tighter leading-none">
            Host
          </span>
        )}
      </div>
    </motion.div>
  );
};
