import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DominoTileData } from '../../engine/types';
import { DominoTile } from '../domino/DominoTile';
import { TileBack } from '../domino/TileBack';
import { soundFx } from '../../engine/audio';

interface ShuffleDealAnimationProps {
  starterTile: DominoTileData | null;
  playerCount: number;
  onComplete: () => void;
}

export const ShuffleDealAnimation: React.FC<ShuffleDealAnimationProps> = ({
  starterTile,
  playerCount,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'shuffle' | 'dealing' | 'starter' | 'done'>('shuffle');

  // 12 lightweight tiles for ultra-smooth 60fps GPU acceleration
  const [tiles] = useState(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 18 + (i % 3) * 12;
      const seat = i % playerCount;

      let targetX = 0;
      let targetY = 0;
      let targetRotate = 0;

      if (seat === 0) {
        // Bottom (User Hand)
        targetX = (i % 3 - 1) * 35;
        targetY = 220;
        targetRotate = (i % 3 - 1) * 5;
      } else if (seat === 1) {
        // Top Seat
        targetX = (i % 3 - 1) * 30;
        targetY = -200;
        targetRotate = (i % 3 - 1) * 4;
      } else if (seat === 2) {
        // Left Seat
        targetX = -230;
        targetY = (i % 3 - 1) * 30;
        targetRotate = 90;
      } else {
        // Right Seat
        targetX = 230;
        targetY = (i % 3 - 1) * 30;
        targetRotate = -90;
      }

      return {
        id: i,
        initX: Math.cos(angle) * radius,
        initY: Math.sin(angle) * radius,
        initRotate: (i * 30) % 360,
        targetX,
        targetY,
        targetRotate,
      };
    });
  });

  useEffect(() => {
    // 1. Instant sound trigger
    soundFx.playShuffleSound();

    // 2. Fast transition to dealing
    const t1 = setTimeout(() => {
      setPhase('dealing');
      soundFx.playDealSlideSound();
    }, 700);

    // 3. Starter reveal
    const t2 = setTimeout(() => {
      setPhase('starter');
      soundFx.playStarterFlipSound();
    }, 1300);

    // 4. Complete smoothly
    const t3 = setTimeout(() => {
      setPhase('done');
      setTimeout(onComplete, 250);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-[1px] select-none"
        >
          {/* Status Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-14 px-3.5 py-1 rounded-full border shadow-md text-xs font-bold tracking-wide z-50 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-ink)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {phase === 'shuffle' && 'Mengocok Kartu Domino...'}
            {phase === 'dealing' && 'Membagikan Kartu...'}
            {phase === 'starter' && 'Membuka Kartu Pertama...'}
          </motion.div>

          {/* Skip Button */}
          <button
            onClick={onComplete}
            className="absolute bottom-5 right-5 px-3 py-1.5 rounded-btn border text-xs font-medium transition-colors hover:opacity-80 z-50"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-ink-secondary)',
            }}
          >
            Lewati &rarr;
          </button>

          {/* Fast Animated Domino Arena */}
          <div className="relative w-full h-full flex items-center justify-center">
            {tiles.map((t) => {
              if (t.id === 0 && phase === 'starter' && starterTile) {
                return (
                  <motion.div
                    key="starter_flip"
                    initial={{ scale: 0.8, rotateY: 180 }}
                    animate={{ scale: 1.1, rotateY: 0, x: 0, y: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                    className="absolute z-50 shadow-2xl"
                  >
                    <DominoTile
                      a={starterTile.a}
                      b={starterTile.b}
                      size="board"
                      isPlayable={false}
                      orientation={starterTile.a === starterTile.b ? 'vertical' : 'horizontal'}
                    />
                  </motion.div>
                );
              }

              let currentX = t.initX;
              let currentY = t.initY;
              let currentRotate = t.initRotate;

              if (phase === 'shuffle') {
                currentRotate = t.initRotate + 180;
                currentX = t.initX * 1.2;
                currentY = t.initY * 1.2;
              } else if (phase === 'dealing' || phase === 'starter') {
                currentX = t.targetX;
                currentY = t.targetY;
                currentRotate = t.targetRotate;
              }

              return (
                <motion.div
                  key={t.id}
                  animate={{
                    x: currentX,
                    y: currentY,
                    rotate: currentRotate,
                    opacity: phase === 'starter' ? 0.4 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: phase === 'shuffle' ? 220 : 320,
                    damping: 24,
                  }}
                  style={{ willChange: 'transform' }}
                  className="absolute pointer-events-none"
                >
                  <TileBack size="board" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
