import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DominoTileData } from '../../engine/types';
import { DominoTile } from '../domino/DominoTile';
import { Button } from '../ui/Button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface PlacementSelectorProps {
  tile: DominoTileData | null;
  leftValue: number | null;
  rightValue: number | null;
  onSelectSide: (side: 'left' | 'right') => void;
  onCancel: () => void;
}

export const PlacementSelector: React.FC<PlacementSelectorProps> = ({
  tile,
  leftValue,
  rightValue,
  onSelectSide,
  onCancel,
}) => {
  if (!tile) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-ink/30 dark:bg-black/60 backdrop-blur-[1px]"
        />

        {/* Action Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative bg-surface dark:bg-surface-dark rounded-modal border border-border dark:border-border-dark shadow-card p-5 z-10 max-w-sm w-full text-center space-y-4 text-ink dark:text-ink-dark"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-ink-secondaryDark">
              Pilih Sisi Penempatan
            </span>
            <button
              onClick={onCancel}
              className="p-1 rounded-md text-ink-secondary dark:text-ink-secondaryDark hover:text-ink dark:hover:text-ink-dark hover:bg-surface-secondary dark:hover:bg-surface-secondaryDark"
              aria-label="Batal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-center py-2">
            <DominoTile
              a={tile.a}
              b={tile.b}
              size="md"
              isPlayable={true}
              isSelected={true}
            />
          </div>

          <p className="text-xs text-ink-secondary dark:text-ink-secondaryDark">
            Kartu ini dapat dimainkan di kedua ujung board ({leftValue} atau {rightValue}).
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => onSelectSide('left')}
              className="flex items-center justify-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Sisi Kiri ({leftValue})
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => onSelectSide('right')}
              className="flex items-center justify-center gap-1.5 font-medium"
            >
              Sisi Kanan ({rightValue})
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
