import React, { useRef, useEffect } from 'react';
import { BoardTile } from '../../engine/types';
import { DominoTile } from '../domino/DominoTile';
import { motion } from 'framer-motion';

interface DominoBoardProps {
  board: BoardTile[];
  leftValue: number | null;
  rightValue: number | null;
  isMyTurn: boolean;
}

export const DominoBoard: React.FC<DominoBoardProps> = ({
  board,
  leftValue,
  rightValue,
  isMyTurn,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      setTimeout(() => {
        container.scrollTo({
          left: (container.scrollWidth - container.clientWidth) / 2,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [board.length]);

  return (
    <div className="relative w-full my-auto flex flex-col items-center justify-center py-4 select-none min-h-[160px] sm:min-h-[220px]">
      <div
        ref={containerRef}
        className="w-full overflow-x-auto overflow-y-hidden py-6 px-8 flex items-center justify-start sm:justify-center no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 min-w-max mx-auto">
          {/* Left Endpoint Indicator */}
          {leftValue !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-sm text-xs font-semibold mr-1 shrink-0"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-ink-secondary)',
              }}
            >
              <span className="text-[10px] uppercase" style={{ color: 'var(--text-ink-muted)' }}>Kiri</span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-ink)' }}>{leftValue}</span>
            </motion.div>
          )}

          {/* Chain Tiles */}
          {board.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-8 px-12 border-2 border-dashed rounded-card text-center"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}
            >
              <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-ink-secondary)' }}>
                Meja Masih Kosong
              </span>
              <span className="text-[11px] mt-0.5" style={{ color: 'var(--text-ink-muted)' }}>
                {isMyTurn ? 'Mainkan kartu pertama Anda' : 'Menunggu pemain pertama'}
              </span>
            </div>
          ) : (
            board.map((bt) => {
              const isDouble = bt.isDouble;
              const orientation = isDouble ? 'vertical' : 'horizontal';

              return (
                <div key={bt.id} className="relative shrink-0">
                  <DominoTile
                    a={bt.a}
                    b={bt.b}
                    displayLeft={bt.displayLeft}
                    displayRight={bt.displayRight}
                    orientation={orientation}
                    size="board"
                    isPlayable={false}
                    animateEntrance={true}
                  />
                </div>
              );
            })
          )}

          {/* Right Endpoint Indicator */}
          {rightValue !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-sm text-xs font-semibold ml-1 shrink-0"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-ink-secondary)',
              }}
            >
              <span className="text-[10px] uppercase" style={{ color: 'var(--text-ink-muted)' }}>Kanan</span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-ink)' }}>{rightValue}</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
