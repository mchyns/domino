import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TurnBannerProps {
  isMyTurn: boolean;
  currentPlayerNickname: string;
  turnDeadline?: number;
  turnDuration?: number;
  lastAction?: {
    type: 'play' | 'pass' | 'start' | 'rematch';
    nickname: string;
    timestamp: number;
  };
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  isMyTurn,
  currentPlayerNickname,
  turnDeadline,
  turnDuration = 15000,
  lastAction,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(15);

  useEffect(() => {
    if (!turnDeadline) {
      setSecondsLeft(15);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, turnDeadline - Date.now());
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, 250);

    return () => clearInterval(interval);
  }, [turnDeadline, turnDuration]);

  return (
    <div className="flex flex-col items-center justify-center my-1.5 select-none z-10">
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
              className="flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-md"
              style={{
                backgroundColor: 'var(--action-bg)',
                color: 'var(--action-text)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Giliran Anda</span>
              <div className="flex items-center gap-0.5 ml-1 text-xs font-mono font-bold text-amber-300">
                <Clock className="w-3 h-3" />
                <span>{secondsLeft}s</span>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                color: 'var(--text-ink-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400" />
              <span>Giliran {currentPlayerNickname}</span>
              <span className="font-mono text-[11px] font-bold text-amber-400">
                ({secondsLeft}s)
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {lastAction && lastAction.type === 'pass' && (
        <motion.span
          key={`action_${lastAction.timestamp}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] mt-0.5"
          style={{ color: 'var(--text-ink-muted)' }}
        >
          {lastAction.nickname} melewati giliran (Pass)
        </motion.span>
      )}
    </div>
  );
};
