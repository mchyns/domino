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

  // On mobile (width < 640px) with more than 7 cards, split into 2 clear rows so no dots are obscured
  const isMobile = containerWidth < 640;
  const isMultiRow = isMobile && hand.length > 7;

  const row1 = isMultiRow ? hand.slice(0, Math.ceil(hand.length / 2)) : hand;
  const row2 = isMultiRow ? hand.slice(Math.ceil(hand.length / 2)) : [];

  const renderTileItem = (tile: DominoTileData, idx: number, totalOffset: number) => {
    const moveInfo = legalMoves[tile.id];
    const isLegal = isMyTurn && (moveInfo?.canPlayLeft || moveInfo?.canPlayRight);
    const isDisabled = isMyTurn && !isLegal;
    const isSelected = selectedTileId === tile.id;

    return (
      <motion.div
        key={tile.id}
        className="relative shrink-0"
        whileHover={{
          scale: 1.08,
          y: -6,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <DominoTile
          a={tile.a}
          b={tile.b}
          size={isMobile ? (isMultiRow ? 'sm' : 'md') : 'hand'}
          orientation="vertical"
          isDisabled={isDisabled}
          isPlayable={isMyTurn && isLegal}
          isSelected={isSelected}
          animateEntrance={true}
          entranceDelay={(totalOffset + idx) * 0.02}
          onClick={() => onTileClick(tile)}
        />
      </motion.div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full border-t p-2 sm:p-3 backdrop-blur-md select-none sticky bottom-0 z-30 shadow-2xl transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-1.5 sm:gap-2">
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

        {/* Hand Cards Container */}
        {hand.length === 0 ? (
          <div className="text-xs italic py-3 text-center" style={{ color: 'var(--text-ink-muted)' }}>
            Tidak ada kartu tersisa di tangan
          </div>
        ) : isMultiRow ? (
          /* 2 Clean Uncrowded Rows on Mobile */
          <div className="w-full flex flex-col items-center justify-center gap-1.5 py-1">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full">
              {row1.map((tile, idx) => renderTileItem(tile, idx, 0))}
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full">
              {row2.map((tile, idx) => renderTileItem(tile, idx, row1.length))}
            </div>
          </div>
        ) : (
          /* Single Row on Desktop or when <= 7 cards */
          <div className="w-full py-1 px-1 flex items-center justify-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar">
            {hand.map((tile, idx) => renderTileItem(tile, idx, 0))}
          </div>
        )}
      </div>
    </div>
  );
};
