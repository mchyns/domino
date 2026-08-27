import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TurnBannerProps {
  isMyTurn: boolean;
  currentPlayerNickname: string;
  lastAction?: {
    type: 'play' | 'pass' | 'start' | 'rematch';
    nickname: string;
    timestamp: number;
  };
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  isMyTurn,
  currentPlayerNickname,
  lastAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center my-2 select-none z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={isMyTurn ? 'my_turn' : currentPlayerNickname}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-2"
        >
          {isMyTurn ? (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm"
              style={{
                backgroundColor: 'var(--action-bg)',
                color: 'var(--action-text)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Giliran Anda</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                color: 'var(--text-ink-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }} />
              <span>Giliran {currentPlayerNickname}</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {lastAction && lastAction.type === 'pass' && (
        <motion.span
          key={`action_${lastAction.timestamp}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] mt-1"
          style={{ color: 'var(--text-ink-muted)' }}
        >
          {lastAction.nickname} melakukan Pass
        </motion.span>
      )}
    </div>
  );
};
