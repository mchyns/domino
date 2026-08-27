import React, { useRef, useState, useEffect } from 'react';
import { DominoTileData, LegalMoveInfo } from '../../engine/types';
import { DominoTile } from '../domino/DominoTile';
import { Button } from '../ui/Button';
import { SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerHandProps {
  hand: DominoTileData[];
  legalMoves: Record<string, LegalMoveInfo>;
  isMyTurn: boolean;
  selectedTileId: string | null;
  onTileClick: (tile: DominoTileData) => void;
  onPassTurn: () => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  legalMoves,
  isMyTurn,
  selectedTileId,
  onTileClick,
  onPassTurn,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(360);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 360);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const hasAnyLegal = Object.values(legalMoves).some(
    (m) => m.canPlayLeft || m.canPlayRight
  );
  const canPass = isMyTurn && !hasAnyLegal;

  // Calculate dynamic tile width & overlap so all cards (up to 14) always fit on mobile screen
  const count = hand.length;
  const availWidth = Math.max(280, containerWidth - 24);

  // Desired tile width: 44px on mobile, 48px on desktop
  const baseTileWidth = containerWidth > 640 ? 48 : 40;
  const totalBaseWidth = count * (baseTileWidth + 4);

  // If cards exceed container width, compute negative margin offset (overlap)
  let overlapOffset = 0;
  if (totalBaseWidth > availWidth && count > 1) {
    overlapOffset = Math.min(baseTileWidth * 0.65, (totalBaseWidth - availWidth) / (count - 1));
  }

  return (
    <div
      ref={containerRef}
      className="w-full border-t p-2 sm:p-4 backdrop-blur-md select-none sticky bottom-0 z-30 shadow-lg transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-1.5 sm:gap-2.5">
        {/* Hand Header: Title & Pass Button */}
        <div className="w-full flex items-center justify-between px-1">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-ink-secondary)' }}
          >
            Kartu Tangan ({hand.length})
          </span>
          <Button
            size="sm"
            variant={canPass ? 'primary' : 'outline'}
            disabled={!canPass}
            onClick={onPassTurn}
            className="h-7 sm:h-8 px-2.5 sm:px-3 text-xs font-medium"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Pass
          </Button>
        </div>

        {/* Adaptive Overlapping Tiles Row (100% Fit on Mobile) */}
        <div className="w-full py-2 px-1 flex items-center justify-center overflow-x-hidden min-h-[94px] sm:min-h-[110px]">
          {hand.length === 0 ? (
            <div className="text-xs italic py-4" style={{ color: 'var(--text-ink-muted)' }}>
              Tidak ada kartu tersisa di tangan
            </div>
          ) : (
            <div className="flex items-center justify-center relative">
              {hand.map((tile, idx) => {
                const moveInfo = legalMoves[tile.id];
                const isLegal = isMyTurn && (moveInfo?.canPlayLeft || moveInfo?.canPlayRight);
                const isDisabled = isMyTurn && !isLegal;
                const isSelected = selectedTileId === tile.id;

                return (
                  <motion.div
                    key={tile.id}
                    className="relative transition-all"
                    style={{
                      marginLeft: idx === 0 ? 0 : `-${overlapOffset}px`,
                      zIndex: isSelected ? 30 : idx + 1,
                    }}
                    whileHover={{
                      zIndex: 40,
                      scale: 1.08,
                      y: -10,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <DominoTile
                      a={tile.a}
                      b={tile.b}
                      size={containerWidth < 400 && count > 8 ? 'sm' : 'hand'}
                      orientation="vertical"
                      isDisabled={isDisabled}
                      isPlayable={isMyTurn && isLegal}
                      isSelected={isSelected}
                      animateEntrance={true}
                      entranceDelay={idx * 0.03}
                      onClick={() => onTileClick(tile)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
