import React from 'react';
import { PlayerPublicInfo } from '../../engine/types';
import { TileBack } from '../domino/TileBack';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface PlayerSeatProps {
  player: PlayerPublicInfo;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right' | 'bottom';
  className?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
  position,
  className,
}) => {
  const initial = player.nickname.charAt(0).toUpperCase() || 'P';
  const tileCount = Math.max(0, player.tileCount);
  const isHorizontalSeat = position === 'left' || position === 'right';

  return (
    <motion.div
      layout
      className={cn(
        'flex items-center gap-2 p-2 rounded-card transition-all duration-200 select-none',
        isHorizontalSeat ? 'flex-col justify-center' : 'flex-row',
        className
      )}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderWidth: isCurrentTurn ? '2px' : '1px',
        borderStyle: 'solid',
        borderColor: isCurrentTurn ? 'var(--text-ink)' : 'var(--border-color)',
        boxShadow: isCurrentTurn
          ? '0 4px 16px rgba(0,0,0,0.15)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        transform: isCurrentTurn ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm border transition-colors"
          style={{
            backgroundColor: isCurrentTurn ? 'var(--action-bg)' : 'var(--bg-surface-secondary)',
            color: isCurrentTurn ? 'var(--action-text)' : 'var(--text-ink)',
            borderColor: isCurrentTurn ? 'var(--action-bg)' : 'var(--border-color)',
          }}
        >
          {initial}
        </div>
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2',
            player.isConnected ? 'bg-emerald-500' : 'bg-amber-500'
          )}
          style={{ borderColor: 'var(--bg-surface)' }}
          title={player.isConnected ? 'Terhubung' : 'Terputus'}
        />
      </div>

      {/* Info & Card Stack */}
      <div className={cn('flex flex-col', isHorizontalSeat ? 'items-center text-center' : 'items-start text-left')}>
        <div className="flex items-center gap-1">
          <span
            className="font-semibold text-xs sm:text-sm max-w-[80px] sm:max-w-[110px] truncate"
            style={{ color: 'var(--text-ink)' }}
          >
            {player.nickname}
          </span>
          {player.isHost && (
            <span className="text-[10px] font-medium" style={{ color: 'var(--accent-color)' }}>
              (Host)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-ink-secondary)' }}>
            {tileCount} kartu
          </span>
          <div className="flex -space-x-2 overflow-hidden py-0.5">
            {Array.from({ length: Math.min(tileCount, 4) }).map((_, i) => (
              <TileBack key={i} size="sm" className="w-[10px] h-[18px] rounded-[2px]" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
